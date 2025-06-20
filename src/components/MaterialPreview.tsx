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
        <div class="page-header-container">
          <div class="logo-placeholder">
            <div style="height: 50px; margin-bottom: 25px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px; font-weight: 500;">Sistema Educacional</div>
          </div>
          ${header}
        </div>
        <div class="content-wrapper">
          ${content}
        </div>
        ${includeFooter ? '<div class="page-footer-container"><p>Gerado automaticamente pelo Sistema Educacional</p></div>' : ''}
      </div>
    `;
  };

  const calculateQuestionHeight = (question: Element): number => {
    const enunciado = question.querySelector('.questao-enunciado')?.textContent || '';
    const opcoes = question.querySelectorAll('.opcao');
    
    // Cálculo mais conservador da altura
    let height = 80; // Base menor
    
    // Altura do texto do enunciado
    const textLines = Math.ceil(enunciado.length / 65); // Menos caracteres por linha
    height += textLines * 22;
    
    // Altura das opções
    opcoes.forEach(opcao => {
      const opcaoText = opcao.textContent || '';
      const opcaoLines = Math.ceil(opcaoText.length / 60);
      height += opcaoLines * 20 + 8; // Altura por linha + margem
    });
    
    // Espaçamento adicional para questões complexas
    if (enunciado.length > 120 || opcoes.length > 3) {
      height += 40;
    }
    
    // Margem entre questões
    height += 40;
    
    console.log(`Question height calculated: ${height}px for question with ${enunciado.length} chars and ${opcoes.length} options`);
    return height;
  };

  const splitContentIntoPages = (htmlContent: string): string[] => {
    console.log('Starting improved page split for:', material.type);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Dimensões de página A4 mais precisas
    const pageHeight = 1056; // A4 height em pixels (297mm)
    const headerHeight = 140; // Cabeçalho menor
    const footerHeight = 50; // Rodapé menor
    const topMargin = 60; // Margem superior adicional
    const bottomMargin = 40; // Margem inferior adicional
    const availableContentHeight = pageHeight - headerHeight - footerHeight - topMargin - bottomMargin;
    
    console.log('New page calculation:', { 
      pageHeight, 
      headerHeight, 
      footerHeight, 
      topMargin, 
      bottomMargin, 
      availableContentHeight 
    });

    // Para atividades e avaliações - dividir por questões
    if (material.type === 'atividade' || material.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container');
      
      if (questions.length === 0) {
        console.log('No questions found, returning single page');
        return [htmlContent];
      }

      console.log(`Processing ${questions.length} questions for pagination`);

      let currentPageContent = '';
      let currentPageHeight = 0;
      
      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      const combinedHeader = header + instructions;
      
      questions.forEach((question, index) => {
        const questionHeight = calculateQuestionHeight(question);
        
        // Verificar se a questão cabe na página atual
        if (currentPageHeight + questionHeight > availableContentHeight && currentPageContent) {
          console.log(`Page break at question ${index + 1}, height: ${currentPageHeight}px`);
          const isFirstPage = pages.length === 0;
          pages.push(wrapPageContent(currentPageContent, isFirstPage ? combinedHeader : '', true, isFirstPage));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += question.outerHTML;
        currentPageHeight += questionHeight;
      });
      
      // Adicionar última página
      if (currentPageContent) {
        const isFirstPage = pages.length === 0;
        pages.push(wrapPageContent(currentPageContent, isFirstPage ? combinedHeader : '', true, isFirstPage));
      }
      
      console.log(`Split into ${pages.length} pages`);
      return pages.length > 0 ? pages : [htmlContent];
    }

    // Para planos de aula - dividir por seções
    if (material.type === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 1) {
        return [htmlContent];
      }

      const pages: string[] = [];
      let currentPageContent = '';
      let currentPageHeight = 0;
      const sectionHeight = 180; // Altura reduzida por seção

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      
      sections.forEach((section, index) => {
        if (currentPageHeight + sectionHeight > availableContentHeight && currentPageContent) {
          const isFirstPage = pages.length === 0;
          pages.push(wrapPageContent(currentPageContent, isFirstPage ? header : '', false, isFirstPage));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += section.outerHTML;
        currentPageHeight += sectionHeight;
      });
      
      if (currentPageContent) {
        const isFirstPage = pages.length === 0;
        pages.push(wrapPageContent(currentPageContent, isFirstPage ? header : '', false, isFirstPage));
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
            margin: 20mm 15mm 20mm 15mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.5;
            color: #333;
            background: white;
            font-size: 14px;
          }
          
          .page-content {
            min-height: calc(100vh - 40mm);
            display: flex;
            flex-direction: column;
            page-break-after: always;
            padding: 0;
            margin: 0;
          }
          
          .page-content:last-child {
            page-break-after: avoid;
          }
          
          .page-header-container {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
            min-height: 120px;
            flex-shrink: 0;
          }
          
          .logo-placeholder {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .content-wrapper {
            flex: 1;
            padding-top: 20px;
            margin-top: 20px;
          }
          
          .page-footer-container {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            font-size: 11px;
            color: #666;
            flex-shrink: 0;
          }
          
          .questao-container {
            margin-bottom: 30px;
            padding: 18px;
            background: #fafafa;
            border-left: 4px solid #3b82f6;
            border-radius: 6px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .questao-numero {
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 12px;
            font-size: 15px;
          }
          
          .questao-enunciado {
            margin-bottom: 16px;
            line-height: 1.6;
            font-size: 13px;
          }
          
          .questao-opcoes {
            margin-left: 16px;
          }
          
          .opcao {
            margin: 8px 0;
            display: flex;
            align-items: flex-start;
            font-size: 13px;
            line-height: 1.4;
          }
          
          .opcao-letra {
            font-weight: bold;
            margin-right: 10px;
            min-width: 20px;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 16px;
            padding-bottom: 6px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .instructions-section {
            background: #f0f9ff;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 12px;
            border-left: 4px solid #0ea5e9;
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
              padding: 20mm 15mm;
              max-width: none;
              height: auto;
              min-height: calc(100vh - 40mm);
            }
            
            .page-header-container {
              margin-bottom: 35px;
              padding-bottom: 18px;
              min-height: 110px;
            }
            
            .content-wrapper {
              margin-top: 18px;
              padding-top: 18px;
            }
            
            .questao-container {
              margin-bottom: 25px;
              padding: 15px;
            }
            
            .section {
              margin-bottom: 25px;
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
