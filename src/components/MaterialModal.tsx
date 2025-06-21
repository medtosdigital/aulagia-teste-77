
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

  const handlePrint = async () => {
    if (!material) return;

    try {
      if (material.type === 'slides') {
        // Para slides, criar HTML otimizado para impressão
        const slidesForPrint = generateSlidesHTML(material);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(slidesForPrint);
          printWindow.document.close();
          printWindow.print();
        }
        toast.success('Slides enviados para impressão!');
      } else {
        // Para outros materiais, usar o método padrão
        await exportService.exportToPDF(material);
        toast.success('Material enviado para impressão!');
      }
    } catch (error) {
      console.error('Erro ao preparar impressão:', error);
      toast.error('Erro ao preparar a impressão');
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'ppt') => {
    if (!material) return;

    try {
      switch (format) {
        case 'pdf':
          if (material.type === 'slides') {
            await exportSlidesToPDF(material);
          } else {
            await exportService.exportToPDF(material);
          }
          toast.success('Material exportado para PDF com sucesso!');
          break;
        case 'word':
          await exportService.exportToWord(material);
          toast.success('Material exportado para Word com sucesso!');
          break;
        case 'ppt':
          if (material.type === 'slides') {
            await exportSlidesToPPT(material);
          } else {
            await exportService.exportToPPT(material);
          }
          toast.success('Material exportado para PowerPoint com sucesso!');
          break;
      }
    } catch (error) {
      toast.error('Erro ao exportar material');
      console.error('Export error:', error);
    }
  };

  const generateSlidesHTML = (material: GeneratedMaterial): string => {
    const slides = generateSlides(material);
    const today = new Date().toLocaleDateString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Slides - ${material.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            background: #f0f2f5;
            font-family: 'Lato', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 30px 0;
            box-sizing: border-box;
          }

          .slide-page {
            position: relative;
            width: 1024px;
            height: 768px;
            background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
            overflow: hidden;
            margin: 0 auto 40px auto;
            box-sizing: border-box;
            box-shadow: 0 15px 40px rgba(0,0,0,0.18);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            border: 1px solid #e0e0e0;
          }

          .slide-page:last-of-type {
            page-break-after: auto;
            margin-bottom: 0;
          }

          .shape-overlay {
            position: absolute;
            opacity: 0.1;
            pointer-events: none;
            z-index: 0;
          }
          
          .shape-overlay.top-left-wave {
            width: 250px;
            height: 250px;
            background: #00C9B1;
            border-radius: 50%;
            top: -120px;
            left: -100px;
            transform: rotate(20deg);
          }
          
          .shape-overlay.bottom-right-wave {
            width: 300px;
            height: 300px;
            background: #FF6B6B;
            border-radius: 50%;
            bottom: -150px;
            right: -130px;
            transform: rotate(-30deg);
          }

          .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 40px;
            flex-shrink: 0;
            z-index: 1;
            position: relative;
          }
          
          .slide-header .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .slide-header .logo {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,123,255,0.4);
          }
          
          .slide-header .logo svg {
            width: 28px;
            height: 28px;
            stroke: white;
            fill: none;
            stroke-width: 2;
          }
          
          .slide-header .brand-text h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 32px;
            color: #333333;
            margin: 0;
            font-weight: 800;
            letter-spacing: -1px;
          }
          
          .slide-header .slide-title-header {
            font-family: 'Poppins', sans-serif;
            font-size: 26px;
            color: #FF6B6B;
            font-weight: 700;
            text-align: right;
          }

          .slide-content {
            flex-grow: 1;
            padding: 0 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: #333333;
            z-index: 1;
            font-size: 1.2rem;
          }

          .slide-content h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 4.5rem;
            color: #333333;
            margin-bottom: 25px;
            font-weight: 800;
            text-align: center;
            width: 100%;
            line-height: 1.2;
          }
          
          .slide-content h3 {
            font-family: 'Poppins', sans-serif;
            font-size: 2.8rem;
            color: #00C9B1;
            margin-top: 30px;
            margin-bottom: 20px;
            font-weight: 700;
            width: 100%;
            text-align: center;
          }
          
          .slide-content p {
            line-height: 1.7;
            margin-bottom: 18px;
            font-size: 1.15rem;
          }
          
          .slide-content ul {
            list-style-type: none;
            padding-left: 0;
            margin-bottom: 18px;
            text-align: left;
          }
          
          .slide-content ul li {
            position: relative;
            padding-left: 35px;
            margin-bottom: 12px;
            font-size: 1.15rem;
          }
          
          .slide-content ul li::before {
            content: '✔';
            position: absolute;
            left: 0;
            color: #FF6B6B;
            font-size: 1.3rem;
            top: -2px;
          }

          .slide-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 40px;
            font-size: 0.95rem;
            color: #666666;
            border-top: 1px solid #e0e0e0;
            flex-shrink: 0;
            z-index: 1;
            font-family: 'Lato', sans-serif;
          }
          
          .slide-footer .page-number {
            font-weight: 600;
            color: #00C9B1;
          }

          @media print {
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .slide-page { 
              box-shadow: none; 
              margin: 0;
              border-radius: 0;
              border: none;
              width: 100%;
              min-height: 100vh;
            }
          }
        </style>
      </head>
      <body>
        ${slides.map((slide, index) => renderSlideForPrint(slide, index, today)).join('')}
      </body>
      </html>
    `;
  };

  const generateSlides = (material: GeneratedMaterial) => {
    const subject = material.subject || 'Disciplina';
    const grade = material.grade || 'Turma';
    const title = material.title || 'Apresentação Educativa';
    const today = new Date().toLocaleDateString('pt-BR');
    
    return [
      // Slide 1: Title
      {
        type: 'title',
        title: title,
        subtitle: `${subject} • ${grade}`,
        professor: 'Professor(a)',
        institution: 'Escola',
        date: today
      },
      // Slide 2: Introduction/Objectives  
      {
        type: 'introduction',
        title: 'Introdução e Objetivos',
        content: `Bem-vindos à nossa aula sobre ${title}. Hoje vamos explorar conceitos fundamentais e aplicações práticas.`,
        objectives: [
          'Compreender os conceitos fundamentais',
          'Analisar exemplos práticos',
          'Aplicar o conhecimento adquirido'
        ]
      },
      // Content slides
      {
        type: 'concept',
        title: 'Conceitos Principais',
        content: `Vamos começar explorando os principais conceitos relacionados a ${title}.`
      },
      {
        type: 'example',
        title: 'Exemplos Práticos',
        content: `Agora vamos ver alguns exemplos práticos de como aplicar esse conhecimento.`
      },
      {
        type: 'process',
        title: 'Processo de Aplicação',
        content: `Entenda o passo a passo para aplicar esses conceitos em situações reais.`
      },
      // Interactive Question
      {
        type: 'question',
        title: 'Vamos Pensar um Pouco?',
        question: `Com base no que aprendemos sobre ${title}, como você aplicaria esse conhecimento no dia a dia?`,
        answer: 'Existem diversas formas de aplicar esse conhecimento, desde situações cotidianas até contextos profissionais.'
      },
      // Final Slide
      {
        type: 'conclusion',
        title: 'Obrigado(a)!',
        content: 'Para mais materiais educativos, visite aulagia.com.br'
      }
    ];
  };

  const renderSlideForPrint = (slide: any, index: number, today: string) => {
    const slideNumber = index + 1;
    
    return `
      <div class="slide-page">
        <div class="shape-overlay top-left-wave"></div>
        <div class="shape-overlay bottom-right-wave"></div>
        
        <div class="slide-header">
          <div class="logo-container">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div class="brand-text">
              <h1>AulagIA</h1>
            </div>
          </div>
          <div class="slide-title-header">${slide.type === 'title' ? 'APRESENTAÇÃO' : slide.type === 'conclusion' ? 'FIM' : material?.subject || 'SLIDES'}</div>
        </div>
        
        <div class="slide-content">
          ${renderSlideContent(slide)}
        </div>
        
        <div class="slide-footer">
          <span class="date">${today}</span>
          <span class="page-number">Slide ${slideNumber}</span>
        </div>
      </div>
    `;
  };

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case 'title':
        return `
          <h2>${slide.title}</h2>
          <h3>${slide.subtitle}</h3>
          <p style="font-size: 1.3rem; margin-top: 30px;">Apresentado por: <br> <strong>${slide.professor}</strong></p>
          <p style="font-size: 1rem; color: #666;">${slide.institution}</p>
        `;
      
      case 'introduction':
        return `
          <h3>${slide.title}</h3>
          <p>${slide.content}</p>
          <p style="font-weight: 600; color: #FF6B6B;">Nossos objetivos para hoje:</p>
          <ul>
            ${slide.objectives.map((obj: string) => `<li>${obj}</li>`).join('')}
          </ul>
        `;
      
      case 'question':
        return `
          <div style="background-color: #f8faff; border: 2px dashed #007bff; border-radius: 16px; padding: 50px; text-align: center;">
            <h3 style="color: #007bff; font-size: 3.5rem; margin-bottom: 30px;">${slide.title}</h3>
            <p style="font-size: 1.6rem; line-height: 1.6; font-weight: 500; color: #444; max-width: 80%;">${slide.question}</p>
          </div>
        `;
      
      case 'conclusion':
        return `
          <h2>OBRIGADO(A)!</h2>
          <p style="font-size: 1.4rem; margin-top: 25px;">Para mais materiais educativos, visite:</p>
          <p style="font-size: 1.8rem; font-weight: 800; color: #FF6B6B; margin-top: 10px;">aulagia.com.br</p>
        `;
      
      default:
        return `
          <h3>${slide.title}</h3>
          <div style="font-size: 1.15rem;">${slide.content}</div>
        `;
    }
  };

  const exportSlidesToPDF = async (material: GeneratedMaterial) => {
    const slidesHTML = generateSlidesHTML(material);
    
    // Criar iframe oculto para renderizar e imprimir
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1024px';
    iframe.style.height = '768px';
    document.body.appendChild(iframe);
    
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(slidesHTML);
    iframe.contentDocument?.close();
    
    // Aguardar carregamento e imprimir
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.print();
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 1000);
  };

  const exportSlidesToPPT = async (material: GeneratedMaterial) => {
    // Para PPT, usar a mesma lógica do PDF por enquanto
    await exportSlidesToPDF(material);
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
