import React, { useState } from 'react';
import { templateService } from '@/services/templateService';
import { GeneratedMaterial } from '@/services/materialService';
import SlideViewer from './SlideViewer';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaterialPreviewProps {
  material: GeneratedMaterial;
  templateId?: string;
}

const MaterialPreview: React.FC<MaterialPreviewProps> = ({ material, templateId }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const getDefaultTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  const wrapPageContent = (content: string, header: string, includeFooter: boolean, isFirstPage: boolean = false): string => {
    return `
      <div class="page-content">
        <div class="page-header-safe-zone">
          <div class="logo-section">
            <div style="height: 40px; margin-bottom: 10px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">Logo</div>
          </div>
          ${isFirstPage ? header : ''}
        </div>
        <div class="main-content">
          ${content}
        </div>
        ${includeFooter ? '<div class="page-footer"></div>' : ''}
      </div>
    `;
  };

  const calculateQuestionHeight = (question: Element): number => {
    const enunciado = question.querySelector('.questao-enunciado')?.textContent || '';
    const opcoes = question.querySelectorAll('.opcao');
    
    // Base height for question structure
    let height = 120; // Base padding, margins, and question number
    
    // Add height based on text length (approximate)
    height += Math.ceil(enunciado.length / 80) * 25; // ~25px per line
    
    // Add height for options
    height += opcoes.length * 35; // ~35px per option
    
    // Add extra space for complex questions
    if (enunciado.length > 200 || opcoes.length > 4) {
      height += 50;
    }
    
    return height;
  };

  const splitContentIntoPages = (htmlContent: string): string[] => {
    console.log('Starting page split process for:', material.type);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Updated page dimensions - now all pages have the same header space reserved
    const pageHeight = 1200;
    const headerFooterHeight = 350; // Space for logo + header/footer on all pages
    const availableContentHeight = pageHeight - headerFooterHeight;
    
    console.log('Page calculation:', { pageHeight, headerFooterHeight, availableContentHeight });

    // Split content by questions or sections for activities and evaluations
    if (material.type === 'atividade' || material.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container');
      
      if (questions.length === 0) {
        console.log('No questions found, returning original content');
        return [htmlContent];
      }

      console.log(`Found ${questions.length} questions to paginate`);

      let currentPageContent = '';
      let currentPageHeight = 0;
      
      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      
      questions.forEach((question, index) => {
        const questionHeight = calculateQuestionHeight(question);
        console.log(`Question ${index + 1} estimated height: ${questionHeight}px`);
        
        // Check if adding this question would exceed page height
        if (currentPageHeight + questionHeight > availableContentHeight && currentPageContent) {
          console.log(`Creating new page at question ${index + 1}, current height: ${currentPageHeight}px`);
          const isFirstPage = pages.length === 0;
          pages.push(wrapPageContent(currentPageContent, header + instructions, true, isFirstPage));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += question.outerHTML;
        currentPageHeight += questionHeight;
      });
      
      // Add remaining content to last page
      if (currentPageContent) {
        const isFirstPage = pages.length === 0;
        pages.push(wrapPageContent(currentPageContent, header + instructions, true, isFirstPage));
      }
      
      console.log(`Split into ${pages.length} pages`);
      return pages.length > 0 ? pages : [htmlContent];
    }

    // For lesson plans, split by sections with better height calculation
    if (material.type === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 1) {
        return [htmlContent];
      }

      const pages: string[] = [];
      let currentPageContent = '';
      let currentPageHeight = 0;
      const sectionHeight = 250; // Average height per section

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      
      sections.forEach((section, index) => {
        if (currentPageHeight + sectionHeight > availableContentHeight && currentPageContent) {
          const isFirstPage = pages.length === 0;
          pages.push(wrapPageContent(currentPageContent, header, false, isFirstPage));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += section.outerHTML;
        currentPageHeight += sectionHeight;
      });
      
      if (currentPageContent) {
        const isFirstPage = pages.length === 0;
        pages.push(wrapPageContent(currentPageContent, header, false, isFirstPage));
      }
      
      return pages.length > 0 ? pages : [htmlContent];
    }

    return [htmlContent];
  };

  const enhanceHtmlWithStyles = (htmlContent: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${material.title}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm 20mm 15mm 20mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .page-content {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm 20mm;
            position: relative;
          }
          
          .page-header-safe-zone {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
            min-height: 120px; /* Increased to accommodate logo space */
          }
          
          .logo-section {
            text-align: center;
            margin-bottom: 15px;
          }
          
          .header-section {
            margin-bottom: 20px;
          }
          
          .instructions-section {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #0ea5e9;
          }
          
          .main-content {
            flex: 1;
            margin-bottom: 30px;
            padding-top: 10px;
          }
          
          .page-footer {
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            font-size: 12px;
            color: #666;
            min-height: 40px;
          }
          
          .questao-container {
            margin-bottom: 30px;
            padding: 20px;
            background: #fafafa;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .questao-numero {
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .questao-enunciado {
            margin-bottom: 20px;
            line-height: 1.8;
            font-size: 14px;
          }
          
          .questao-opcoes {
            margin-left: 25px;
          }
          
          .opcao {
            margin: 10px 0;
            display: flex;
            align-items: flex-start;
            font-size: 14px;
          }
          
          .opcao-letra {
            font-weight: bold;
            margin-right: 15px;
            min-width: 25px;
          }
          
          .espaco-resposta {
            border-bottom: 1px solid #ccc;
            margin: 15px 0;
            min-height: 30px;
          }
          
          .area-calculo {
            border: 1px dashed #ccc;
            padding: 25px;
            margin: 20px 0;
            background: #f9f9f9;
            text-align: center;
            color: #666;
            font-style: italic;
          }
          
          .area-desenho {
            border: 2px solid #ccc;
            padding: 50px;
            margin: 20px 0;
            background: white;
            text-align: center;
            color: #666;
            font-style: italic;
            min-height: 150px;
          }
          
          .texto-interpretacao {
            background: #f0f8ff;
            padding: 20px;
            border-left: 4px solid #1e90ff;
            margin: 20px 0;
            font-style: italic;
          }
          
          .section {
            margin-bottom: 35px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 20px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .page-content {
              margin: 0;
              padding: 15mm 20mm;
              max-width: none;
              height: auto;
              min-height: auto;
              page-break-after: always;
            }
            
            .page-content:last-child {
              page-break-after: avoid;
            }
            
            .page-header-safe-zone {
              margin-bottom: 30px;
              padding-bottom: 15px;
            }
            
            .questao-container {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 25px;
            }
            
            .section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  };

  const renderMaterial = () => {
    const selectedTemplateId = templateId || getDefaultTemplateId(material.type);
    
    try {
      const renderedHtml = templateService.renderTemplate(selectedTemplateId, material.content);
      
      // Se for slides, usar o SlideViewer
      if (material.type === 'slides') {
        return <SlideViewer htmlContent={renderedHtml} />;
      }
      
      // Split content into pages
      const pages = splitContentIntoPages(renderedHtml);
      
      if (pages.length === 1) {
        // Single page - render directly
        return (
          <iframe
            srcDoc={enhanceHtmlWithStyles(pages[0])}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white'
            }}
            title="Material Preview"
          />
        );
      }

      // Multiple pages - render with navigation
      return (
        <div className="multi-page-container h-full flex flex-col">
          {/* Page Navigation */}
          <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">
                Página {currentPage + 1} de {pages.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
                className="flex items-center space-x-1"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-hidden">
            <iframe
              srcDoc={enhanceHtmlWithStyles(pages[currentPage])}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'white'
              }}
              title={`Material Preview - Página ${currentPage + 1}`}
            />
          </div>
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar template:', error);
      return (
        <div className="error-message p-4 text-center">
          <p className="text-red-600 text-sm">Erro ao carregar o template do material.</p>
        </div>
      );
    }
  };

  return (
    <div className="material-preview-container w-full h-full overflow-hidden bg-gray-50">
      <div className="w-full h-full">
        {renderMaterial()}
      </div>
    </div>
  );
};

export default MaterialPreview;
