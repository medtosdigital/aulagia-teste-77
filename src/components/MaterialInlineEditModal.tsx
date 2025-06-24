
import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { materialService, type GeneratedMaterial } from '@/services/materialService';
import { templateService } from '@/services/templateService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import SlideViewer from './SlideViewer';

interface MaterialInlineEditModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const MaterialInlineEditModal: React.FC<MaterialInlineEditModalProps> = ({
  material,
  open,
  onClose,
  onSave
}) => {
  const isMobile = useIsMobile();
  const [editedMaterial, setEditedMaterial] = useState<GeneratedMaterial | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (material && open) {
      setEditedMaterial(JSON.parse(JSON.stringify(material)));
      setCurrentPage(0);
    }
  }, [material, open]);

  const handleSave = async () => {
    if (!editedMaterial) return;

    setLoading(true);
    try {
      const success = materialService.updateMaterial(editedMaterial.id, editedMaterial);
      if (success) {
        toast.success('Material atualizado com sucesso!');
        onSave();
        onClose();
      } else {
        toast.error('Erro ao atualizar material');
      }
    } catch (error) {
      toast.error('Erro ao salvar material');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  // USAR EXATAMENTE O MESMO SISTEMA DE TEMPLATE DO MATERIALPREVIEW
  const wrapPageContentWithTemplate = (content: string, isFirstPage: boolean): string => {
    const pageClass = isFirstPage ? 'first-page-content' : 'subsequent-page-content';
    const contentClass = isFirstPage ? 'content' : 'content subsequent-page';
    
    const getFooterText = () => {
      if (editedMaterial?.type === 'plano-de-aula') {
        return `Plano de aula gerado pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      } else if (editedMaterial?.type === 'atividade') {
        return `Atividade gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      } else {
        return `Avaliação gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      }
    };
    
    return `
      <div class="page ${pageClass}">
        <!-- Formas decorativas -->
        <div class="shape-circle purple"></div>
        <div class="shape-circle blue"></div>

        <!-- Cabeçalho AulagIA - Visível em todas as páginas - NÃO EDITÁVEL -->
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

        <!-- Rodapé - Visível em todas as páginas - NÃO EDITÁVEL -->
        <div class="footer">
          ${getFooterText()}
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

  // USAR EXATAMENTE O MESMO SISTEMA DE PAGINAÇÃO DO MATERIALPREVIEW
  const splitContentIntoPages = (htmlContent: string): string[] => {
    console.log('Starting optimized page split for:', editedMaterial?.type);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Para atividades e avaliações - usar o mesmo sistema do MaterialPreview
    if (editedMaterial?.type === 'atividade' || editedMaterial?.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container, .question');
      
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
          // Título do Material
          pageContent += editedMaterial.type === 'atividade' ? '<h2>ATIVIDADE</h2>' : '<h2>AVALIAÇÃO</h2>';
          
          // Informações básicas do Material
          pageContent += `
            <table>
              <tr>
                <th>Escola:</th>
                <td>_________________________________</td>
                <th>Data:</th>
                <td>${new Date().toLocaleDateString('pt-BR')}</td>
              </tr>
              <tr>
                <th>Disciplina:</th>
                <td>${editedMaterial.subject || '[DISCIPLINA]'}</td>
                <th>Série/Ano:</th>
                <td>${editedMaterial.grade || '[SERIE_ANO]'}</td>
              </tr>
              <tr>
                <th>Aluno(a):</th>
                <td class="student-info-cell">____________________________________________</td>
                <th>${editedMaterial.type === 'avaliacao' ? 'NOTA:' : 'BNCC:'}</th>
                <td class="student-info-cell ${editedMaterial.type === 'avaliacao' ? 'nota-highlight-cell' : ''}">${editedMaterial.type === 'avaliacao' ? '' : '{{Código da BNCC}}'}</td>
              </tr>
            </table>
          `;
          
          // Instruções do Material
          pageContent += `
            <div class="instructions">
              <strong>${editedMaterial.title}:</strong><br>
              ${instructions || (editedMaterial.type === 'avaliacao' ? 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.' : 'Leia atentamente cada questão e responda de acordo com o solicitado.')}
            </div>
          `;
        }
        
        questionsForPage.forEach(question => {
          pageContent += question.outerHTML;
        });

        pages.push(wrapPageContentWithTemplate(pageContent, isFirstPage));
      }
      
      console.log(`Split into ${pages.length} optimized pages`);
      return pages.length > 0 ? pages : [htmlContent];
    }

    // Para planos de aula - manter lógica do MaterialPreview
    if (editedMaterial?.type === 'plano-de-aula') {
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

  // USAR EXATAMENTE O MESMO SISTEMA DE TEMPLATE DO MATERIALPREVIEW
  const enhanceHtmlWithNewTemplate = (htmlContent: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${editedMaterial?.title}</title>
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
          
          /* ... keep existing code (shape-circle, header, footer, content styling) the same ... */
          
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
            pointer-events: none !important;
          }
          .header .logo svg {
            width: 16px;
            height: 16px;
            stroke: white;
            fill: none;
            stroke-width: 2;
            pointer-events: none !important;
          }
          .header .brand-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            pointer-events: none !important;
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
            pointer-events: none !important;
          }
          .header .brand-text p {
            font-size: 8px;
            color: #6b7280;
            margin: -1px 0 0 0;
            font-family: 'Inter', sans-serif;
            line-height: 1;
            font-weight: 400;
            pointer-events: none !important;
          }
          
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
          table .student-info-cell {
            width: 32%;
          }
          
          .nota-highlight-cell {
            background-color: #fef3c7;
            color: #000000;
            font-weight: 600;
            border: 2px solid #f59e0b;
          }
          
          .instructions {
            background: #eff6ff;
            padding: 15px;
            border-left: 4px solid #0ea5e9;
            margin-bottom: 30px;
            font-family: 'Inter', sans-serif;
            border-radius: 6px;
          }

          .questao-container, .question {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .questao-numero, .question-header {
            font-weight: 600;
            color: #4338ca;
            margin-bottom: 10px;
            font-size: 1.0rem;
            font-family: 'Inter', sans-serif;
          }
          .questao-enunciado, .question-text {
            margin-bottom: 15px;
            text-align: justify;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            line-height: 1.4;
          }
          .questao-opcoes, .options {
            margin-left: 20px;
          }
          .opcao, .option {
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
          }
          .opcao-letra, .option-letter {
            font-weight: bold;
            margin-right: 10px;
            color: #4338ca;
            min-width: 25px;
            pointer-events: none !important;
          }
          
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
            pointer-events: none !important;
          }

          /* Estilos para campos editáveis */
          .editable-field {
            transition: all 0.2s ease;
            cursor: text;
            min-height: 20px;
            outline: none;
            background: rgba(59, 130, 246, 0.05) !important;
            border: 1px dashed rgba(59, 130, 246, 0.3) !important;
            border-radius: 4px !important;
            padding: 4px 8px !important;
          }
          .editable-field:hover {
            background: rgba(59, 130, 246, 0.1) !important;
            border-color: #3b82f6 !important;
          }
          .editable-field:focus {
            background: white !important;
            border-color: #2563eb !important;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
          }
          
          /* ... keep existing code (print styles) the same ... */
          
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
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  };

  const makeContentEditable = (htmlContent: string): string => {
    let editableHtml = htmlContent;

    // Tornar conteúdo editável mas EXCLUIR logo e rodapé
    editableHtml = editableHtml.replace(
      /<h([1-6])([^>]*)>([^<]*)<\/h([1-6])>/g,
      (match, tag1, attrs, content, tag2) => {
        if (content.includes('AulagIA')) return match;
        return `<h${tag1}${attrs} class="editable-field" contenteditable="true">${content}</h${tag2}>`;
      }
    );

    editableHtml = editableHtml.replace(
      /<p([^>]*)>([^<]*)<\/p>/g,
      (match, attrs, content) => {
        if (content.includes('Sua aula com toque mágico') || content.includes('aulagia.com.br')) return match;
        return `<p${attrs} class="editable-field" contenteditable="true">${content}</p>`;
      }
    );

    // Tornar questões editáveis
    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*questao-enunciado[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1 class="questao-enunciado editable-field" contenteditable="true">$2</div>'
    );

    // Tornar opções editáveis
    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*opcao[^"]*"[^>]*)>(<span[^>]*class="[^"]*opcao-letra[^"]*"[^>]*>[A-E]\)<\/span>)\s*([^<]*)<\/div>/g,
      '<div$1>$2 <span class="editable-field" contenteditable="true">$3</span></div>'
    );

    return editableHtml;
  };

  const renderMaterialWithSameSystem = () => {
    if (!editedMaterial) return null;

    const selectedTemplateId = getDefaultTemplateId(editedMaterial.type);
    
    try {
      const renderedHtml = templateService.renderTemplate(selectedTemplateId, editedMaterial.content);
      
      // Se for slides, usar o SlideViewer IGUAL ao MaterialPreview
      if (editedMaterial.type === 'slides') {
        return <SlideViewer htmlContent={makeContentEditable(renderedHtml)} material={editedMaterial} />;
      }
      
      // Split content into pages com o MESMO sistema do MaterialPreview
      const pages = splitContentIntoPages(renderedHtml);
      
      if (pages.length === 1) {
        // Single page - render directly
        return (
          <iframe
            srcDoc={enhanceHtmlWithNewTemplate(makeContentEditable(pages[0]))}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white'
            }}
            title="Material Editor"
          />
        );
      }

      // Multiple pages - render with navigation IGUAL ao MaterialPreview
      return (
        <div className="multi-page-container h-full flex flex-col relative">
          {/* Desktop Navigation Bar - IGUAL ao MaterialPreview */}
          {!isMobile && (
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
          )}

          {/* Mobile Page Counter - IGUAL ao MaterialPreview */}
          {isMobile && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl border-2">
              <div className="flex items-center space-x-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-700">
                  {currentPage + 1} / {pages.length}
                </span>
              </div>
            </div>
          )}

          {/* Mobile Floating Navigation Buttons - IGUAL ao MaterialPreview */}
          {isMobile && pages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 w-24 h-24 rounded-full shadow-2xl bg-white/95 backdrop-blur-sm disabled:opacity-30 border-3"
              >
                <ChevronLeft className="w-12 h-12" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50 w-24 h-24 rounded-full shadow-2xl bg-white/95 backdrop-blur-sm disabled:opacity-30 border-3"
              >
                <ChevronRight className="w-12 h-12" />
              </Button>
            </>
          )}

          {/* Page Content */}
          <div className="flex-1 overflow-hidden">
            <iframe
              srcDoc={enhanceHtmlWithNewTemplate(makeContentEditable(pages[currentPage]))}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'white'
              }}
              title={`Material Editor - Página ${currentPage + 1}`}
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

  if (!editedMaterial) return null;

  // Layout Mobile - USANDO O MESMO SISTEMA DO MATERIALPREVIEW
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl flex-shrink-0">
              <SheetTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                <Edit3 className="h-5 w-5" />
                Editar Material
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-hidden">
              {renderMaterialWithSameSystem()}
            </div>
            
            <div className="p-4 space-y-3 bg-white border-t flex-shrink-0 rounded-b-3xl">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-xl"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Layout Desktop - USANDO O MESMO SISTEMA DO MATERIALPREVIEW
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex rounded-2xl">
        <div className="flex-1 overflow-hidden rounded-l-2xl">
          {renderMaterialWithSameSystem()}
        </div>
        
        <div className="w-80 bg-gray-50 border-l flex flex-col rounded-r-2xl">
          <DialogHeader className="p-6 pb-4 border-b bg-white rounded-tr-2xl">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Editar Material
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <h3 className="font-semibold">Material</h3>
              <div>
                <span className="font-medium">Título:</span>
                <Input
                  value={editedMaterial.title}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, title: e.target.value })}
                  className="mt-1 border-dashed border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 bg-blue-50 hover:bg-blue-100 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <span className="font-medium">Disciplina:</span>
                <Input
                  value={editedMaterial.subject}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, subject: e.target.value })}
                  className="mt-1 border-dashed border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 bg-blue-50 hover:bg-blue-100 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <span className="font-medium">Turma:</span>
                <Input
                  value={editedMaterial.grade}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, grade: e.target.value })}
                  className="mt-1 border-dashed border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 bg-blue-50 hover:bg-blue-100 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t mt-auto rounded-br-2xl space-y-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-lg"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialInlineEditModal;
