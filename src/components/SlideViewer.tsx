import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Printer, Download } from 'lucide-react';
import { Button } from './ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { exportService } from '@/services/exportService';
import { GeneratedMaterial } from '@/services/materialService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface SlideViewerProps {
  htmlContent: string;
  material?: GeneratedMaterial;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ htmlContent, material }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();
  
  // Generate slides based on content
  const slides = React.useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Extract main topic and details from material
    const subject = material?.subject || 'Disciplina';
    const grade = material?.grade || 'Turma';
    const title = material?.title || 'Apresentação Educativa';
    const today = new Date().toLocaleDateString('pt-BR');
    
    // Split content into logical sections for slides
    const sections = doc.querySelectorAll('h1, h2, h3, .section, .topic');
    const contentSections = Array.from(sections).map(section => ({
      title: section.textContent?.trim() || '',
      content: section.nextElementSibling?.innerHTML || section.innerHTML || ''
    }));

    // Generate structured slides
    const generatedSlides = [
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
      // Generate content slides from sections
      ...contentSections.slice(0, 10).map((section, index) => ({
        type: index % 4 === 0 ? 'concept' : 
             index % 4 === 1 ? 'example' :
             index % 4 === 2 ? 'process' : 'comparison',
        title: section.title,
        content: section.content
      })),
      // Slide: Interactive Question
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

    return generatedSlides;
  }, [htmlContent, material]);

  const handlePrint = async () => {
    try {
      // Create print-friendly HTML
      const printContent = generatePrintHTML();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success('Slides enviados para impressão!');
    } catch (error) {
      toast.error('Erro ao preparar impressão');
      console.error('Print error:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (material) {
        // Create enhanced material for PDF export
        const enhancedMaterial = {
          ...material,
          content: generatePrintHTML()
        };
        await exportService.exportToPDF(enhancedMaterial);
        toast.success('PDF exportado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleExportPPT = async () => {
    try {
      if (material) {
        // Create enhanced material for PPT export
        const enhancedMaterial = {
          ...material,
          content: generateSlidesForPPT()
        };
        await exportService.exportToPPT(enhancedMaterial);
        toast.success('PowerPoint exportado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao exportar PPT:', error);
      toast.error('Erro ao exportar PowerPoint');
    }
  };

  const generatePrintHTML = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Slides - ${material?.title || 'Apresentação'}</title>
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
        ${slides.map((slide, index) => renderSlideForPrint(slide, index)).join('')}
      </body>
      </html>
    `;
  };

  const generateSlidesForPPT = () => {
    return slides.map((slide, index) => ({
      title: slide.title,
      content: slide.content,
      slideNumber: index + 1,
      type: slide.type
    }));
  };

  const renderSlideForPrint = (slide: any, index: number) => {
    const slideNumber = index + 1;
    const today = new Date().toLocaleDateString('pt-BR');
    
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
          ${renderSlideContent(slide, index)}
        </div>
      </div>
    `;
  };

  const renderSlideContent = (slide: any, index: number) => {
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

  const renderSlide = (slide: any, index: number) => {
    const slideNumber = index + 1;
    
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-teal-400 rounded-full opacity-10 -translate-x-16 -translate-y-16 rotate-12"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-coral-400 rounded-full opacity-10 translate-x-20 translate-y-20 -rotate-12"></div>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">AulagIA</h1>
          </div>
          <div className="text-lg font-bold text-coral-500">
            {slide.type === 'title' ? 'APRESENTAÇÃO' : 
             slide.type === 'conclusion' ? 'FIM' : 
             slide.type === 'question' ? 'INTERAÇÃO' : 
             material?.subject || 'SLIDES'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
          {slide.type === 'title' && (
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-bold text-gray-800 leading-tight">{slide.title}</h2>
              <h3 className="text-2xl font-semibold text-teal-600">{slide.subtitle}</h3>
              <div className="mt-8 space-y-3">
                <p className="text-lg text-gray-600">Apresentado por:</p>
                <p className="text-xl font-bold text-gray-800">{slide.professor}</p>
                <p className="text-sm text-gray-500">{slide.institution}</p>
              </div>
            </div>
          )}

          {slide.type === 'introduction' && (
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-teal-600 text-center">{slide.title}</h3>
              <p className="text-lg text-gray-700 leading-relaxed text-center">{slide.content}</p>
              <p className="text-lg font-semibold text-coral-500 text-center">Nossos objetivos para hoje:</p>
              <ul className="space-y-3 max-w-2xl mx-auto">
                {slide.objectives.map((objective: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="text-coral-500 font-bold">✔</span>
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {slide.type === 'question' && (
            <div className="text-center bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-12 space-y-6">
              <h3 className="text-4xl font-bold text-blue-600">{slide.title}</h3>
              <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">{slide.question}</p>
              <button className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md hover:bg-coral-600 transition-colors">
                Clique para pensar!
              </button>
            </div>
          )}

          {slide.type === 'conclusion' && (
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-bold text-gray-800">OBRIGADO(A)!</h2>
              <p className="text-xl text-gray-600 mt-6">Para mais materiais educativos, visite:</p>
              <p className="text-2xl font-bold text-coral-500 mt-3">aulagia.com.br</p>
              <p className="text-base text-gray-500 mt-8">
                Slides gerados pela AulagIA<br/>
                Sua aula com toque mágico
              </p>
            </div>
          )}

          {(slide.type === 'concept' || slide.type === 'example' || slide.type === 'process' || slide.type === 'comparison') && (
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-teal-600 text-center">{slide.title}</h3>
              <div className="text-lg text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: slide.content }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Nenhum slide encontrado
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Slide Content com proporção 4:3 corrigida */}
      <div className="flex-1 flex justify-center items-center p-4">
        {isMobile ? (
          // Mobile: Container com altura muito maior para visualização adequada
          <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200" 
               style={{ aspectRatio: '4/3', maxWidth: '100%', height: '75vh', minHeight: '500px' }}>
            <div className="w-full h-full">
              {renderSlide(slides[currentSlide], currentSlide)}
            </div>
          </div>
        ) : (
          // Desktop: Container com largura e altura balanceadas para não cortar
          <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200" 
               style={{ aspectRatio: '4/3', maxWidth: '800px', height: '60vh', minHeight: '450px' }}>
            <div className="w-full h-full">
              {renderSlide(slides[currentSlide], currentSlide)}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      {!isMobile && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 h-12 px-6 text-base font-semibold bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </Button>

            {/* Page Info and Numbers */}
            <div className="flex items-center gap-4">
              <div className="text-lg font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                Página {currentSlide + 1} de {slides.length}
              </div>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 ${
                      currentSlide === index 
                        ? 'bg-blue-600 text-white shadow-lg scale-110' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-2 h-12 px-6 text-base font-semibold bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200">
          <div className="px-4 py-4">
            {/* Principais botões de navegação - AUMENTADOS */}
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                variant="outline"
                className={`flex items-center gap-3 h-16 px-8 text-lg font-bold rounded-2xl border-3 transition-all duration-200 shadow-lg ${
                  currentSlide === 0 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 active:scale-95'
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
                Anterior
              </Button>

              <Button
                onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === slides.length - 1}
                className={`flex items-center gap-3 h-16 px-8 text-lg font-bold rounded-2xl transition-all duration-200 shadow-lg ${
                  currentSlide === slides.length - 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-3 border-gray-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                Próximo
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Indicador de página central - AUMENTADO */}
            <div className="text-center text-lg font-bold text-gray-700 bg-gray-100 py-4 rounded-2xl mb-4">
              Página {currentSlide + 1} de {slides.length}
            </div>

            {/* Números das páginas - AUMENTADOS */}
            <div className="flex justify-center items-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-14 h-14 rounded-full text-lg font-bold transition-all duration-200 shadow-lg ${
                    currentSlide === index 
                      ? 'bg-blue-600 text-white shadow-xl scale-110' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideViewer;
