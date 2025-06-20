
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

  const wrapPageContent = (content: string, header: string, includeFooter: boolean): string => {
    return `
      <div class="page-content">
        ${header}
        <div class="main-content">
          ${content}
        </div>
        ${includeFooter ? '<div class="page-footer"></div>' : ''}
      </div>
    `;
  };

  const splitContentIntoPages = (htmlContent: string): string[] => {
    // Check if content needs to be split into multiple pages
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const contentHeight = tempDiv.scrollHeight;
    const pageHeight = 1000; // Approximate page height in pixels
    
    if (contentHeight <= pageHeight) {
      return [htmlContent];
    }

    // Split content by questions or sections for activities and evaluations
    if (material.type === 'atividade' || material.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container');
      
      if (questions.length === 0) {
        return [htmlContent];
      }

      let currentPageContent = '';
      let currentPageHeight = 0;
      const headerFooterHeight = 200; // Space for header and footer
      
      // Add header to first page
      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      
      questions.forEach((question, index) => {
        const questionHeight = 300; // Approximate height per question
        
        if (currentPageHeight + questionHeight > pageHeight - headerFooterHeight && currentPageContent) {
          // Create new page
          pages.push(wrapPageContent(currentPageContent, pages.length === 0 ? header + instructions : '', true));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += question.outerHTML;
        currentPageHeight += questionHeight;
      });
      
      // Add remaining content to last page
      if (currentPageContent) {
        pages.push(wrapPageContent(currentPageContent, pages.length === 0 ? header + instructions : '', true));
      }
      
      return pages.length > 0 ? pages : [htmlContent];
    }

    // For lesson plans, split by sections
    if (material.type === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 1) {
        return [htmlContent];
      }

      const pages: string[] = [];
      let currentPageContent = '';
      let sectionCount = 0;
      const sectionsPerPage = 2;

      // Add header to first page
      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      
      sections.forEach((section, index) => {
        if (sectionCount >= sectionsPerPage && currentPageContent) {
          pages.push(wrapPageContent(currentPageContent, index === 0 ? header : '', false));
          currentPageContent = '';
          sectionCount = 0;
        }
        
        currentPageContent += section.outerHTML;
        sectionCount++;
      });
      
      if (currentPageContent) {
        pages.push(wrapPageContent(currentPageContent, pages.length === 0 ? header : '', false));
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
            padding: 20mm;
            position: relative;
          }
          
          .header-section {
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 15px;
          }
          
          .main-content {
            flex: 1;
            margin-bottom: 30px;
          }
          
          .page-footer {
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          
          .questao-container {
            margin-bottom: 25px;
            padding: 15px;
            background: #fafafa;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          
          .questao-numero {
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
            font-size: 16px;
          }
          
          .questao-enunciado {
            margin-bottom: 15px;
            line-height: 1.8;
          }
          
          .questao-opcoes {
            margin-left: 20px;
          }
          
          .opcao {
            margin: 8px 0;
            display: flex;
            align-items: flex-start;
          }
          
          .opcao-letra {
            font-weight: bold;
            margin-right: 10px;
            min-width: 20px;
          }
          
          .espaco-resposta {
            border-bottom: 1px solid #ccc;
            margin: 10px 0;
            min-height: 25px;
          }
          
          .area-calculo {
            border: 1px dashed #ccc;
            padding: 20px;
            margin: 15px 0;
            background: #f9f9f9;
            text-align: center;
            color: #666;
            font-style: italic;
          }
          
          .area-desenho {
            border: 2px solid #ccc;
            padding: 40px;
            margin: 15px 0;
            background: white;
            text-align: center;
            color: #666;
            font-style: italic;
            min-height: 150px;
          }
          
          .texto-interpretacao {
            background: #f0f8ff;
            padding: 15px;
            border-left: 4px solid #1e90ff;
            margin: 15px 0;
            font-style: italic;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .instructions-section {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #0ea5e9;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .page-content {
              margin: 0;
              padding: 15mm;
              max-width: none;
              height: 100vh;
            }
            
            .questao-container {
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
