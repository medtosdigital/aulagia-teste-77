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

  const createPageStructure = (content: string, pageNumber: number, totalPages: number): string => {
    return `
      <div class="page-wrapper">
        <div class="page-header">
          <div class="logo-section">
            <img src="/placeholder.svg" alt="Logo" class="page-logo">
          </div>
          <div class="header-info">
            <h1 class="material-title">${material.title}</h1>
            <div class="material-details">
              ${material.subject ? `<span class="subject">${material.subject}</span>` : ''}
              ${material.grade ? `<span class="grade">${material.grade}</span>` : ''}
              ${material.type === 'atividade' || material.type === 'avaliacao' ? 
                '<div class="student-info"><span>Nome: ________________________</span><span>Data: ___/___/____</span></div>' : 
                ''
              }
            </div>
          </div>
          <div class="decorative-circle"></div>
        </div>
        
        <div class="page-content-area">
          ${content}
        </div>
        
        <div class="page-footer">
          <div class="footer-separator"></div>
          <div class="footer-content">
            <span class="footer-text">Gerado automaticamente pelo Sistema Educacional</span>
            <span class="page-number">Página ${pageNumber} de ${totalPages}</span>
          </div>
        </div>
      </div>
    `;
  };

  const calculateQuestionHeight = (question: Element): number => {
    const enunciado = question.querySelector('.questao-enunciado')?.textContent || '';
    const opcoes = question.querySelectorAll('.opcao');
    
    // Base height for question structure
    let height = 150; // Increased base height
    
    // Add height based on text length (approximate)
    height += Math.ceil(enunciado.length / 70) * 25; // More conservative line calculation
    
    // Add height for options
    height += opcoes.length * 40; // Increased option height
    
    // Add extra space for complex questions
    if (enunciado.length > 200 || opcoes.length > 4) {
      height += 60;
    }
    
    // Add space for calculation areas or drawing areas
    if (question.querySelector('.area-calculo') || question.querySelector('.area-desenho')) {
      height += 100;
    }
    
    return height;
  };

  const splitContentIntoPages = (htmlContent: string): string[] => {
    console.log('Starting improved page split process for:', material.type);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Updated page dimensions for better A4 compatibility with proper margins
    const pageHeight = 1100; // Adjusted for A4 with margins
    const headerHeight = 180; // Fixed header height including logo and title
    const footerHeight = 80; // Fixed footer height
    const availableContentHeight = pageHeight - headerHeight - footerHeight - 40; // Extra safety margin
    
    console.log('Page calculation:', { pageHeight, headerHeight, footerHeight, availableContentHeight });

    // Split content by questions or sections for activities and evaluations
    if (material.type === 'atividade' || material.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container');
      
      if (questions.length === 0) {
        console.log('No questions found, returning single page with full structure');
        return [createPageStructure(htmlContent, 1, 1)];
      }

      console.log(`Found ${questions.length} questions to paginate`);

      let currentPageContent = '';
      let currentPageHeight = 0;
      
      // Extract instructions if present
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      
      // Add instructions to first page if they exist
      if (instructions) {
        currentPageContent = instructions;
        currentPageHeight += 80; // Estimated instructions height
      }
      
      questions.forEach((question, index) => {
        const questionHeight = calculateQuestionHeight(question);
        console.log(`Question ${index + 1} estimated height: ${questionHeight}px, current page height: ${currentPageHeight}px`);
        
        // Check if adding this question would exceed page height
        if (currentPageHeight + questionHeight > availableContentHeight && currentPageContent) {
          console.log(`Creating new page at question ${index + 1}, current height: ${currentPageHeight}px`);
          pages.push(currentPageContent);
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += question.outerHTML;
        currentPageHeight += questionHeight;
      });
      
      // Add remaining content to last page
      if (currentPageContent) {
        pages.push(currentPageContent);
      }
      
      // Wrap each page with full structure
      const structuredPages = pages.map((pageContent, index) => 
        createPageStructure(pageContent, index + 1, pages.length)
      );
      
      console.log(`Split into ${structuredPages.length} pages with full structure`);
      return structuredPages.length > 0 ? structuredPages : [createPageStructure(htmlContent, 1, 1)];
    }

    // For lesson plans, split by sections with full page structure
    if (material.type === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 2) {
        return [createPageStructure(htmlContent, 1, 1)];
      }

      const pages: string[] = [];
      let currentPageContent = '';
      let currentPageHeight = 0;
      const sectionHeight = 280; // Average height per section

      sections.forEach((section, index) => {
        if (currentPageHeight + sectionHeight > availableContentHeight && currentPageContent) {
          pages.push(currentPageContent);
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += section.outerHTML;
        currentPageHeight += sectionHeight;
      });
      
      if (currentPageContent) {
        pages.push(currentPageContent);
      }
      
      // Wrap each page with full structure
      const structuredPages = pages.map((pageContent, index) => 
        createPageStructure(pageContent, index + 1, pages.length)
      );
      
      return structuredPages.length > 0 ? structuredPages : [createPageStructure(htmlContent, 1, 1)];
    }

    return [createPageStructure(htmlContent, 1, 1)];
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
            margin: 10mm 15mm 10mm 15mm;
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
          }
          
          .page-wrapper {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            page-break-after: always;
            position: relative;
            padding: 15mm 20mm;
            max-width: 210mm;
            margin: 0 auto;
          }
          
          .page-wrapper:last-child {
            page-break-after: avoid;
          }
          
          .page-header {
            position: relative;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
            min-height: 120px;
          }
          
          .logo-section {
            flex-shrink: 0;
            margin-right: 20px;
          }
          
          .page-logo {
            height: 50px;
            width: auto;
          }
          
          .header-info {
            flex-grow: 1;
            text-align: center;
          }
          
          .material-title {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          
          .material-details {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 10px;
          }
          
          .subject, .grade {
            background: #f0f9ff;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            color: #0ea5e9;
            border: 1px solid #0ea5e9;
          }
          
          .student-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 15px;
            font-size: 14px;
          }
          
          .decorative-circle {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 50%;
            opacity: 0.8;
            z-index: -1;
          }
          
          .page-content-area {
            flex: 1;
            margin-bottom: 20px;
          }
          
          .page-footer {
            margin-top: auto;
            padding-top: 15px;
          }
          
          .footer-separator {
            height: 1px;
            background: #e5e5e5;
            margin-bottom: 10px;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
          }
          
          .questao-container {
            margin-bottom: 35px;
            padding: 25px;
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
            font-size: 18px;
          }
          
          .questao-enunciado {
            margin-bottom: 20px;
            line-height: 1.8;
            font-size: 15px;
          }
          
          .questao-opcoes {
            margin-left: 20px;
          }
          
          .opcao {
            margin: 12px 0;
            display: flex;
            align-items: flex-start;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .opcao-letra {
            font-weight: bold;
            margin-right: 12px;
            min-width: 25px;
          }
          
          .instructions-section {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #0ea5e9;
          }
          
          .area-calculo, .area-desenho {
            border: 1px dashed #ccc;
            padding: 40px;
            margin: 20px 0;
            background: #f9f9f9;
            text-align: center;
            color: #666;
            font-style: italic;
            min-height: 120px;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
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
            
            .page-wrapper {
              margin: 0;
              padding: 10mm 15mm;
              max-width: none;
              min-height: calc(297mm - 20mm);
            }
            
            .page-header {
              margin-bottom: 25px;
              padding-bottom: 15px;
            }
            
            .questao-container {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 30px;
            }
            
            .section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .decorative-circle {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
