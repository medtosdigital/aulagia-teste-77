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

  const wrapPageContent = (content: string, isFirstPage: boolean, materialType: string, materialTitle: string): string => {
    const standardHeader = `
      <div class="page-header-complete">
        <div class="logo-section">
          <div class="logo-circle"></div>
          <h3 class="logo-text">Sistema Educacional</h3>
        </div>
        <div class="material-info">
          <h2 class="material-title">${materialTitle}</h2>
          <div class="material-meta">
            <span class="material-type">${getTypeLabel(materialType)}</span>
            <span class="separator">•</span>
            <span class="material-subject">${material.subject || 'Disciplina'}</span>
            <span class="separator">•</span>
            <span class="material-grade">${material.grade || 'Série'}</span>
          </div>
        </div>
      </div>
    `;

    const studentInfo = (materialType === 'atividade' || materialType === 'avaliacao') ? `
      <div class="student-info-section">
        <div class="student-field">
          <label>Nome:</label>
          <div class="field-line"></div>
        </div>
        <div class="student-field">
          <label>Data:</label>
          <div class="field-line short"></div>
        </div>
        <div class="student-field">
          <label>Turma:</label>
          <div class="field-line short"></div>
        </div>
      </div>
    ` : '';

    const footer = `
      <div class="page-footer">
        <div class="footer-decorative-circle"></div>
        <p class="footer-text">Gerado automaticamente pelo Sistema Educacional</p>
        <div class="footer-line"></div>
      </div>
    `;

    return `
      <div class="page-content">
        ${standardHeader}
        ${studentInfo}
        <div class="main-content-area">
          ${content}
        </div>
        ${footer}
      </div>
    `;
  };

  const getTypeLabel = (type: string): string => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
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
    
    // Ajustar altura da página para acomodar cabeçalho completo e rodapé
    const pageHeight = 1100; // Reduzido para dar mais espaço aos elementos fixos
    const headerFooterHeight = 400; // Aumentado para incluir cabeçalho completo e rodapé
    const availableContentHeight = pageHeight - headerFooterHeight;
    
    console.log('Page calculation:', { pageHeight, headerFooterHeight, availableContentHeight });

    // Split content by questions or sections for activities and evaluations
    if (material.type === 'atividade' || material.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container');
      
      if (questions.length === 0) {
        console.log('No questions found, returning original content with wrapper');
        return [wrapPageContent(htmlContent, true, material.type, material.title)];
      }

      console.log(`Found ${questions.length} questions to paginate`);

      let currentPageContent = '';
      let currentPageHeight = 0;
      
      // Remove cabeçalho original do conteúdo, pois será adicionado pelo wrapper
      const originalHeader = tempDiv.querySelector('.header-section');
      const originalInstructions = tempDiv.querySelector('.instructions-section');
      
      // Preservar apenas as instruções para a primeira página
      const instructionsContent = originalInstructions?.outerHTML || '';
      
      questions.forEach((question, index) => {
        const questionHeight = calculateQuestionHeight(question);
        console.log(`Question ${index + 1} estimated height: ${questionHeight}px`);
        
        // Check if adding this question would exceed page height
        if (currentPageHeight + questionHeight > availableContentHeight && currentPageContent) {
          console.log(`Creating new page at question ${index + 1}, current height: ${currentPageHeight}px`);
          const isFirstPage = pages.length === 0;
          const pageContent = isFirstPage ? instructionsContent + currentPageContent : currentPageContent;
          pages.push(wrapPageContent(pageContent, isFirstPage, material.type, material.title));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += question.outerHTML;
        currentPageHeight += questionHeight;
      });
      
      // Add remaining content to last page
      if (currentPageContent) {
        const isFirstPage = pages.length === 0;
        const pageContent = isFirstPage ? instructionsContent + currentPageContent : currentPageContent;
        pages.push(wrapPageContent(pageContent, isFirstPage, material.type, material.title));
      }
      
      console.log(`Split into ${pages.length} pages`);
      return pages.length > 0 ? pages : [wrapPageContent(htmlContent, true, material.type, material.title)];
    }

    // For lesson plans, split by sections with better height calculation
    if (material.type === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 1) {
        return [wrapPageContent(htmlContent, true, material.type, material.title)];
      }

      const pages: string[] = [];
      let currentPageContent = '';
      let currentPageHeight = 0;
      const sectionHeight = 250; // Average height per section
      
      sections.forEach((section, index) => {
        if (currentPageHeight + sectionHeight > availableContentHeight && currentPageContent) {
          const isFirstPage = pages.length === 0;
          pages.push(wrapPageContent(currentPageContent, isFirstPage, material.type, material.title));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += section.outerHTML;
        currentPageHeight += sectionHeight;
      });
      
      if (currentPageContent) {
        const isFirstPage = pages.length === 0;
        pages.push(wrapPageContent(currentPageContent, isFirstPage, material.type, material.title));
      }
      
      return pages.length > 0 ? pages : [wrapPageContent(htmlContent, true, material.type, material.title)];
    }

    return [wrapPageContent(htmlContent, true, material.type, material.title)];
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
            min-height: 100vh;
          }
          
          .page-content {
            display: flex;
            flex-direction: column;
            min-height: calc(100vh - 20mm);
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm 0;
            position: relative;
            page-break-after: always;
          }
          
          .page-content:last-child {
            page-break-after: avoid;
          }
          
          .page-header-complete {
            margin-bottom: 25px;
            padding: 20px 25mm;
            border-bottom: 3px solid #e5e5e5;
            background: #fafafa;
            position: relative;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .logo-circle {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 50%;
            margin-right: 15px;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          }
          
          .logo-text {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
          }
          
          .material-info {
            text-align: center;
          }
          
          .material-title {
            font-size: 22px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 8px;
          }
          
          .material-meta {
            font-size: 14px;
            color: #64748b;
          }
          
          .separator {
            margin: 0 8px;
            color: #cbd5e1;
          }
          
          .student-info-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 25mm 30px 25mm;
            padding: 15px 20px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          
          .student-field {
            display: flex;
            align-items: center;
          }
          
          .student-field label {
            font-weight: 600;
            color: #374151;
            margin-right: 10px;
            font-size: 14px;
          }
          
          .field-line {
            border-bottom: 2px solid #d1d5db;
            height: 20px;
            width: 200px;
          }
          
          .field-line.short {
            width: 120px;
          }
          
          .main-content-area {
            flex: 1;
            padding: 0 25mm;
            margin-bottom: 30px;
          }
          
          .page-footer {
            margin-top: auto;
            padding: 20px 25mm;
            border-top: 2px solid #e5e5e5;
            background: #f9fafb;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .footer-decorative-circle {
            width: 25px;
            height: 25px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            margin-right: 12px;
            box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
          }
          
          .footer-text {
            font-size: 12px;
            color: #6b7280;
            font-style: italic;
          }
          
          .footer-line {
            position: absolute;
            top: 0;
            left: 25mm;
            right: 25mm;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #10b981);
          }
          
          .questao-container {
            margin-bottom: 30px;
            padding: 25px;
            background: #fafafa;
            border-left: 5px solid #3b82f6;
            border-radius: 10px;
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
            margin-left: 20px;
          }
          
          .opcao {
            margin: 12px 0;
            display: flex;
            align-items: flex-start;
            font-size: 14px;
          }
          
          .opcao-letra {
            font-weight: bold;
            margin-right: 15px;
            min-width: 25px;
          }
          
          .instructions-section {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #3b82f6;
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
              padding: 10mm 0;
              max-width: none;
              min-height: calc(100vh - 20mm);
            }
            
            .page-header-complete {
              margin-bottom: 20px;
              padding: 15px 20mm;
            }
            
            .main-content-area {
              padding: 0 20mm;
            }
            
            .page-footer {
              padding: 15px 20mm;
            }
            
            .student-info-section {
              margin: 15px 20mm 25px 20mm;
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
