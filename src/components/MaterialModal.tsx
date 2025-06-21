
import React, { useState } from 'react';
import { X, Download, Printer, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import MaterialPreview from './MaterialPreview';
import AnswerKeyModal from './AnswerKeyModal';
import { GeneratedMaterial } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import { templateService } from '@/services/templateService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaterialModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ material, open, onClose }) => {
  const isMobile = useIsMobile();
  const [answerKeyModalOpen, setAnswerKeyModalOpen] = useState(false);

  const getTypeLabel = (type: string): string => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  const splitContentIntoPages = (htmlContent: string, material: GeneratedMaterial): string[] => {
    console.log('MaterialModal: Starting page split for printing:', material.type);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Para atividades e avaliações - usar o mesmo sistema do MaterialPreview
    if (material.type === 'atividade' || material.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container, .question');
      
      if (questions.length === 0) {
        console.log('MaterialModal: No questions found, returning single page');
        return [htmlContent];
      }

      console.log(`MaterialModal: Found ${questions.length} questions to paginate`);

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      const questionsPerPage = 4; // Baseado no MaterialPreview: 4 questões por página
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
          pageContent += material.type === 'atividade' ? '<h2>ATIVIDADE</h2>' : '<h2>AVALIAÇÃO</h2>';
          
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
                <td>${material.subject || '[DISCIPLINA]'}</td>
                <th>Série/Ano:</th>
                <td>${material.grade || '[SERIE_ANO]'}</td>
              </tr>
              <tr>
                <th>Aluno(a):</th>
                <td class="student-info-cell">____________________________________________</td>
                <th>${material.type === 'avaliacao' ? 'NOTA:' : 'BNCC:'}</th>
                <td class="student-info-cell ${material.type === 'avaliacao' ? 'nota-highlight-cell' : ''}">${material.type === 'avaliacao' ? '' : '{{Código da BNCC}}'}</td>
              </tr>
            </table>
          `;
          
          // Instruções do Material
          pageContent += `
            <div class="instructions">
              <strong>${material.title}:</strong><br>
              ${instructions || (material.type === 'avaliacao' ? 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.' : 'Leia atentamente cada questão e responda de acordo com o solicitado.')}
            </div>
          `;
        }
        
        questionsForPage.forEach(question => {
          pageContent += question.outerHTML;
        });

        pages.push(wrapPageContentWithTemplate(pageContent, isFirstPage));
      }
      
      console.log(`MaterialModal: Split into ${pages.length} pages`);
      return pages.length > 0 ? pages : [htmlContent];
    }

    return [htmlContent];
  };

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
          ${material?.type === 'atividade' ? 'Atividade' : 'Avaliação'} gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    if (!material) return;

    try {
      const templateId = getTemplateId(material.type);
      const renderedHtml = templateService.renderTemplate(templateId, material.content);
      
      // Dividir conteúdo em páginas usando o mesmo sistema do MaterialPreview
      const pages = splitContentIntoPages(renderedHtml, material);
      
      let finalHtml = '';
      pages.forEach((page) => {
        finalHtml += page;
      });
      
      const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${material.title}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Inter', sans-serif;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .page {
              width: 210mm;
              min-height: 297mm;
              background: white;
              margin: 0;
              box-sizing: border-box;
              position: relative;
              display: flex;
              flex-direction: column;
              padding: 0;
              border-radius: 0;
              box-shadow: none;
              page-break-after: always;
            }

            .page:last-of-type {
              page-break-after: auto;
            }

            .shape-circle {
              position: absolute;
              border-radius: 50%;
              opacity: 0.25;
              pointer-events: none;
              z-index: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
              gap: 6px;
            }
            .header .logo {
              width: 24px;
              height: 24px;
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              flex-shrink: 0;
              box-shadow: 0 2px 6px rgba(14, 165, 233, 0.2);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header .logo svg {
              width: 14px;
              height: 14px;
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
              font-size: 14px;
              color: #0ea5e9;
              margin: 0;
              font-family: 'Inter', sans-serif;
              line-height: 1;
              font-weight: 700;
              letter-spacing: -0.2px;
              text-transform: none !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header .brand-text p {
              font-size: 7px;
              color: #6b7280;
              margin: 0;
              font-family: 'Inter', sans-serif;
              line-height: 1;
              font-weight: 400;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
              color: #4f46e5 !important;
              position: relative;
              font-family: 'Inter', sans-serif;
              font-weight: 700;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h2::after {
              content: '';
              width: 50px;
              height: 3px;
              background: #a78bfa !important;
              display: block;
              margin: 6px auto 0;
              border-radius: 2px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
              background: #f3f4f6 !important;
              color: #1f2937;
              font-weight: 600;
              text-align: left;
              width: 18%;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
              background-color: #fef3c7 !important;
              color: #000000;
              font-weight: 600;
              border: 2px solid #f59e0b !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
              color: #4338ca !important;
              margin-bottom: 10px;
              font-size: 1.0rem;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
              color: #4338ca !important;
              min-width: 25px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
            }
          </style>
        </head>
        <body>
          ${finalHtml}
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(styledHtml);
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao preparar impressão:', error);
      toast.error('Erro ao preparar a impressão');
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'ppt') => {
    if (!material) return;

    try {
      const toastId = toast.loading(`Gerando ${format.toUpperCase()}...`);
      
      switch (format) {
        case 'pdf':
          await exportService.exportToPDF(material);
          toast.success('Material exportado para PDF com sucesso!', { id: toastId });
          break;
        case 'word':
          await exportService.exportToWord(material);
          toast.success('Material exportado para Word com sucesso!', { id: toastId });
          break;
        case 'ppt':
          await exportService.exportToPPT(material);
          toast.success('Material exportado para PowerPoint com sucesso!', { id: toastId });
          break;
      }
    } catch (error) {
      toast.error('Erro ao exportar material');
      console.error('Export error:', error);
    }
  };

  const canGenerateAnswerKey = material && (material.type === 'atividade' || material.type === 'avaliacao');

  if (!material) return null;

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onClose}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
            <div className="h-full flex flex-col">
              {/* Header */}
              <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl">
                <SheetTitle className="text-lg font-bold text-center">
                  {material.title}
                </SheetTitle>
                <div className="text-sm text-gray-600 text-center">
                  {getTypeLabel(material.type)} • {material.subject} • {material.grade}
                </div>
              </SheetHeader>
              
              {/* Content Preview - Scaled down to fit without scrolling */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full border rounded-2xl bg-gray-50 overflow-hidden shadow-inner">
                  <div 
                    className="origin-top-left transform scale-[0.3] w-[333%] h-[333%] overflow-hidden"
                    style={{ transformOrigin: '0 0' }}
                  >
                    <MaterialPreview material={material} />
                  </div>
                </div>
              </div>
              
              {/* Export Buttons */}
              <div className="p-4 space-y-3 bg-white border-t">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="text-xs"
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Imprimir
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  
                  {material.type === 'slides' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('ppt')}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PPT
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('word')}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Word
                    </Button>
                  )}
                </div>
                
                {/* Answer Key Button */}
                {canGenerateAnswerKey && (
                  <Button
                    variant="outline"
                    onClick={() => setAnswerKeyModalOpen(true)}
                    className="w-full text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Gerar Gabarito
                  </Button>
                )}
                
                {/* Close Button */}
                <Button
                  variant="default"
                  onClick={onClose}
                  className="w-full bg-gray-800 hover:bg-gray-900"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AnswerKeyModal 
          material={material}
          open={answerKeyModalOpen}
          onClose={() => setAnswerKeyModalOpen(false)}
        />
      </>
    );
  }

  // Desktop layout
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex">
          <div className="flex-1 overflow-hidden">
            <MaterialPreview material={material} />
          </div>
          
          {/* Sidebar com botões */}
          <div className="w-80 bg-gray-50 border-l flex flex-col">
            <DialogHeader className="p-6 pb-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold">
                  Exportar Material
                </DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="p-6 space-y-4">
              <Button
                variant="outline"
                size="default"
                onClick={handlePrint}
                className="w-full justify-start"
              >
                <Printer className="h-4 w-4 mr-3" />
                Imprimir
              </Button>
              
              <Button
                variant="outline"
                size="default"
                onClick={() => handleExport('pdf')}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-3" />
                PDF
              </Button>
              
              {material.type !== 'slides' && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => handleExport('word')}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-3" />
                  Microsoft Word
                </Button>
              )}
              
              {material.type === 'slides' && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => handleExport('ppt')}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-3" />
                  PPT
                </Button>
              )}

              {/* Answer Key Button */}
              {canGenerateAnswerKey && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setAnswerKeyModalOpen(true)}
                  className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                >
                  <FileCheck className="h-4 w-4 mr-3" />
                  Gerar Gabarito
                </Button>
              )}
            </div>
            
            <div className="p-6 border-t mt-auto">
              <div className="text-sm text-gray-600 space-y-2">
                <h3 className="font-semibold">Detalhes</h3>
                <div>
                  <span className="font-medium">Disciplina:</span> {material.subject}
                </div>
                <div>
                  <span className="font-medium">Turma:</span> {material.grade}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {getTypeLabel(material.type)}
                </div>
                <div>
                  <span className="font-medium">Criado:</span> {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <Button
                variant="default"
                onClick={onClose}
                className="w-full mt-6 bg-gray-800 hover:bg-gray-900"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnswerKeyModal 
        material={material}
        open={answerKeyModalOpen}
        onClose={() => setAnswerKeyModalOpen(false)}
      />
    </>
  );
};

export default MaterialModal;
