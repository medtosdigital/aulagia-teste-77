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

  // Novo método para criar páginas com o template otimizado
  const wrapPageContentWithTemplate = (content: string, isFirstPage: boolean): string => {
    const pageClass = isFirstPage ? 'first-page-content' : 'subsequent-page-content';
    const contentClass = isFirstPage ? 'content' : 'content subsequent-page';
    
    return `
      <div class="page ${pageClass}">
        <!-- Formas decorativas -->
        <div class="shape-circle purple"></div>
        <div class="shape-circle blue"></div>

        <!-- Cabeçalho AulagIA - Visível em todas as páginas -->
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div class="brand-text">
              <h1>AulagIA</h1>
              <p>Sua aula com toque mágico</p>
            </div>
          </div>
        </div>

        <!-- Rodapé - Visível em todas as páginas -->
        <div class="footer">
          ${material.type === 'atividade' ? 'Atividade' : 'Avaliação'} gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

  // Sistema de paginação otimizado baseado no template fornecido
  const splitContentIntoPages = (htmlContent: string): string[] => {
    console.log('Starting optimized page split for:', material.type);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Para atividades e avaliações - usar o novo sistema de paginação
    if (material.type === 'atividade' || material.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container');
      
      if (questions.length === 0) {
        console.log('No questions found, returning single page');
        return [htmlContent];
      }

      console.log(`Processing ${questions.length} questions for optimized pagination`);

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      const questionsPerPage = 4; // Baseado no template: 4 questões por página
      let questionIndex = 0;

      while (questionIndex < questions.length) {
        const isFirstPage = pages.length === 0;
        const questionsForPage = [];
        
        // Adicionar até 4 questões por página
        for (let i = 0; i < questionsPerPage && questionIndex < questions.length; i++) {
          questionsForPage.push(questions[questionIndex]);
          questionIndex++;
        }

        // Construir conteúdo da página
        let pageContent = '';
        if (isFirstPage) {
          pageContent += header + instructions;
        }
        
        questionsForPage.forEach(question => {
          pageContent += question.outerHTML;
        });

        pages.push(wrapPageContentWithTemplate(pageContent, isFirstPage));
      }
      
      console.log(`Split into ${pages.length} optimized pages`);
      return pages.length > 0 ? pages : [htmlContent];
    }

    // Para planos de aula - manter lógica existente
    if (material.type === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 1) {
        return [htmlContent];
      }

      const pages: string[] = [];
      const sectionsPerPage = 3; // Reduzido para melhor formatação
      let sectionIndex = 0;

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      
      while (sectionIndex < sections.length) {
        const isFirstPage = pages.length === 0;
        const sectionsForPage = [];
        
        for (let i = 0; i < sectionsPerPage && sectionIndex < sections.length; i++) {
          sectionsForPage.push(sections[sectionIndex]);
          sectionIndex++;
        }

        let pageContent = '';
        if (isFirstPage) {
          pageContent += header;
        }
        
        sectionsForPage.forEach(section => {
          pageContent += section.outerHTML;
        });

        pages.push(wrapPageContentWithTemplate(pageContent, isFirstPage));
      }
      
      return pages.length > 0 ? pages : [htmlContent];
    }

    return [htmlContent];
  };

  const enhanceHtmlWithOptimizedStyles = (htmlContent: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${material.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          /* Define página A4 para impressão e visualização */
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #f0f4f8;
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            min-height: 100vh;
            padding: 20px 0;
          }
          
          /* Container no tamanho A4 - Cada .page será uma folha */
          .page {
            position: relative;
            width: 210mm;
            min-height: 297mm;
            background: white;
            overflow: hidden;
            margin: 0 auto 20px auto;
            box-sizing: border-box;
            padding: 0;
            display: flex;
            flex-direction: column;
            border-radius: 6px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            page-break-after: always;
          }

          .page:last-of-type {
            page-break-after: auto;
            margin-bottom: 0;
          }
          
          /* Formas decorativas */
          .shape-circle {
            position: absolute;
            border-radius: 50%;
            opacity: 0.25;
            pointer-events: none;
            z-index: 0;
          }
          .shape-circle.purple {
            width: 180px; 
            height: 180px;
            background: #a78bfa;
            top: -60px; 
            left: -40px;
          }
          .shape-circle.blue {
            width: 240px; 
            height: 240px;
            background: #60a5fa;
            bottom: -80px; 
            right: -60px;
          }
          
          /* Cabeçalho que aparece no topo */
          .header {
            position: absolute;
            top: 6mm;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            z-index: 999;
            height: 12mm;
            background: transparent;
            padding: 0 12mm;
            flex-shrink: 0;
          }
          .header .logo-container {
            display: flex;
            align-items: center;
            gap: 3px;
          }
          .header .logo {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(14, 165, 233, 0.2);
          }
          .header .logo svg {
            width: 16px;
            height: 16px;
            stroke: white;
            fill: none;
            stroke-width: 2;
          }
          .header .brand-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .header .brand-text h1 {
            font-size: 20px;
            color: #0ea5e9;
            margin: 0;
            font-family: 'Inter', sans-serif;
            line-height: 1;
            font-weight: 700;
            letter-spacing: -0.2px;
            text-transform: none;
          }
          .header .brand-text p {
            font-size: 8px;
            color: #6b7280;
            margin: -1px 0 0 0;
            font-family: 'Inter', sans-serif;
            line-height: 1;
            font-weight: 400;
          }
          
          /* Conteúdo principal com margem para não sobrepor o cabeçalho */
          .content {
            margin-top: 20mm;
            margin-bottom: 12mm;
            padding: 0 15mm;
            position: relative;
            flex: 1;
            overflow: visible;
            z-index: 1;
          }

          .content.subsequent-page {
            margin-top: 40mm;
          }

          /* Elementos do conteúdo */
          h2 {
            text-align: center;
            margin: 10px 0 18px 0;
            font-size: 1.5rem;
            color: #4f46e5;
            position: relative;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
          }
          h2::after {
            content: '';
            width: 50px;
            height: 3px;
            background: #a78bfa;
            display: block;
            margin: 6px auto 0;
            border-radius: 2px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          th, td {
            padding: 8px 12px;
            font-size: 0.85rem;
            border: none;
            font-family: 'Inter', sans-serif;
            vertical-align: top;
          }
          th {
            background: #f3f4f6;
            color: #1f2937;
            font-weight: 600;
            text-align: left;
            width: 18%;
          }
          td {
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
          }
          td:last-child {
            border-bottom: none;
          }
          
          .instructions-section {
            background: #eff6ff;
            padding: 15px;
            border-left: 4px solid #0ea5e9;
            margin-bottom: 30px;
            font-family: 'Inter', sans-serif;
            border-radius: 6px;
          }

          .questao-container {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .questao-numero {
            font-weight: 600;
            color: #4338ca;
            margin-bottom: 10px;
            font-size: 1.0rem;
            font-family: 'Inter', sans-serif;
          }
          .questao-enunciado {
            margin-bottom: 15px;
            text-align: justify;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            line-height: 1.4;
          }
          .questao-opcoes {
            margin-left: 20px;
          }
          .opcao {
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
          }
          .opcao-letra {
            font-weight: bold;
            margin-right: 10px;
            color: #4338ca;
            min-width: 25px;
          }
          
          .answer-lines {
            border-bottom: 1px solid #d1d5db;
            margin-bottom: 8px;
            height: 20px;
            padding: 0;
            background: none;
            border-radius: 0;
            min-height: 20px;
          }
          .answer-lines:last-child {
            margin-bottom: 0;
          }
          
          /* Rodapé */
          .footer {
            position: absolute;
            bottom: 6mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.7rem;
            color: #6b7280;
            z-index: 999;
            height: 6mm;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            padding: 0 15mm;
            font-family: 'Inter', sans-serif;
            flex-shrink: 0;
          }
          
          /* Ajustes para impressão */
          @media print {
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page { 
              box-shadow: none; 
              margin: 0;
              border-radius: 0;
              width: 100%;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .shape-circle {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header, .footer {
              position: fixed;
              background: transparent;
            }
            .header .logo {
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h2 {
              color: #4f46e5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h2::after {
              background: #a78bfa !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .questao-numero {
              color: #4338ca !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            th {
              background: #f3f4f6 !important;
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
      
      // Split content into pages com o novo sistema
      const pages = splitContentIntoPages(renderedHtml);
      
      if (pages.length === 1) {
        // Single page - render directly
        return (
          <iframe
            srcDoc={enhanceHtmlWithOptimizedStyles(pages[0])}
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
              srcDoc={enhanceHtmlWithOptimizedStyles(pages[currentPage])}
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
