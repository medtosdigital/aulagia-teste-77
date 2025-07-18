
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { GeneratedMaterial } from '@/services/materialService';

interface SlideViewerProps {
  material: GeneratedMaterial;
  htmlContent?: string;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ material, htmlContent }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();

  // Verificar se o conteúdo é JSON ou HTML
  const isJsonContent = typeof material.content === 'object' && material.content !== null;
  const slideData = isJsonContent ? material.content : null;

  // Se não for JSON, usar o HTML fornecido ou tentar extrair do material
  const fallbackHtml = htmlContent || (typeof material.content === 'string' ? material.content : '');

  const slides = React.useMemo(() => {
    if (!slideData) {
      // Fallback para HTML: dividir em slides baseado em divs
      const parser = new DOMParser();
      const doc = parser.parseFromString(fallbackHtml, 'text/html');
      const slideElements = doc.querySelectorAll('.slide');
      
      return Array.from(slideElements).map((slide, index) => ({
        id: index,
        content: slide.outerHTML
      }));
    }

    // Criar slides a partir do JSON
    const slidesList = [];
    
    // Slide 1 - Título
    slidesList.push({
      id: 1,
      title: slideData.titulo || 'Apresentação',
      subtitle: `${slideData.disciplina} - ${slideData.serie}`,
      content: `
        <div class="slide slide-title">
          <div class="slide-content">
            <h1 class="slide-main-title">${slideData.titulo || 'Apresentação'}</h1>
            <h2 class="slide-subtitle">${slideData.disciplina} - ${slideData.serie}</h2>
            ${slideData.slide_1_image ? `<div class="slide-image"><img src="${slideData.slide_1_image}" alt="Imagem sobre ${slideData.tema}" /></div>` : ''}
            <p class="slide-presenter">Apresentado por: ${slideData.professor || 'Professor(a)'}</p>
          </div>
        </div>
      `
    });

    // Slide 2 - Objetivos
    slidesList.push({
      id: 2,
      title: 'Objetivos da Aula',
      content: `
        <div class="slide slide-objectives">
          <div class="slide-content">
            <h2 class="slide-title">Objetivos da Aula</h2>
            <ul class="slide-list">
              <li>${slideData.objetivo_1 || 'Objetivo 1'}</li>
              <li>${slideData.objetivo_2 || 'Objetivo 2'}</li>
              <li>${slideData.objetivo_3 || 'Objetivo 3'}</li>
              <li>${slideData.objetivo_4 || 'Objetivo 4'}</li>
            </ul>
          </div>
        </div>
      `
    });

    // Slide 3 - Introdução
    slidesList.push({
      id: 3,
      title: slideData.introducao_titulo || 'Introdução',
      content: `
        <div class="slide slide-intro">
          <div class="slide-content">
            <h2 class="slide-title">${slideData.introducao_titulo || 'Introdução'}</h2>
            <p class="slide-text">${slideData.introducao_conteudo || ''}</p>
            ${slideData.slide_3_image ? `<div class="slide-image"><img src="${slideData.slide_3_image}" alt="Introdução ao tema" /></div>` : ''}
          </div>
        </div>
      `
    });

    // Slide 4 - Conceitos
    slidesList.push({
      id: 4,
      title: slideData.conceitos_titulo || 'Conceitos Fundamentais',
      content: `
        <div class="slide slide-concepts">
          <div class="slide-content">
            <h2 class="slide-title">${slideData.conceitos_titulo || 'Conceitos Fundamentais'}</h2>
            <p class="slide-text">${slideData.conceitos_conteudo || ''}</p>
            ${slideData.slide_4_image ? `<div class="slide-image"><img src="${slideData.slide_4_image}" alt="Conceitos fundamentais" /></div>` : ''}
          </div>
        </div>
      `
    });

    // Slide 5 - Desenvolvimento 1
    slidesList.push({
      id: 5,
      title: slideData.desenvolvimento_1_titulo || 'Aspectos Importantes',
      content: `
        <div class="slide slide-development">
          <div class="slide-content">
            <h2 class="slide-title">${slideData.desenvolvimento_1_titulo || 'Aspectos Importantes'}</h2>
            <p class="slide-text">${slideData.desenvolvimento_1_conteudo || ''}</p>
            ${slideData.slide_5_image ? `<div class="slide-image"><img src="${slideData.slide_5_image}" alt="Aspectos importantes" /></div>` : ''}
          </div>
        </div>
      `
    });

    // Slide 6 - Desenvolvimento 2
    slidesList.push({
      id: 6,
      title: slideData.desenvolvimento_2_titulo || 'Aplicações Práticas',
      content: `
        <div class="slide slide-development">
          <div class="slide-content">
            <h2 class="slide-title">${slideData.desenvolvimento_2_titulo || 'Aplicações Práticas'}</h2>
            <p class="slide-text">${slideData.desenvolvimento_2_conteudo || ''}</p>
            ${slideData.slide_6_image ? `<div class="slide-image"><img src="${slideData.slide_6_image}" alt="Aplicações práticas" /></div>` : ''}
          </div>
        </div>
      `
    });

    // Slide 7 - Desenvolvimento 3
    slidesList.push({
      id: 7,
      title: slideData.desenvolvimento_3_titulo || 'Características',
      content: `
        <div class="slide slide-development">
          <div class="slide-content">
            <h2 class="slide-title">${slideData.desenvolvimento_3_titulo || 'Características'}</h2>
            <p class="slide-text">${slideData.desenvolvimento_3_conteudo || ''}</p>
          </div>
        </div>
      `
    });

    // Slide 8 - Desenvolvimento 4
    slidesList.push({
      id: 8,
      title: slideData.desenvolvimento_4_titulo || 'Importância',
      content: `
        <div class="slide slide-development">
          <div class="slide-content">
            <h2 class="slide-title">${slideData.desenvolvimento_4_titulo || 'Importância'}</h2>
            <p class="slide-text">${slideData.desenvolvimento_4_conteudo || ''}</p>
          </div>
        </div>
      `
    });

    // Slide 9 - Exemplo
    slidesList.push({
      id: 9,
      title: slideData.exemplo_titulo || 'Exemplo Prático',
      content: `
        <div class="slide slide-example">
          <div class="slide-content">
            <h2 class="slide-title">${slideData.exemplo_titulo || 'Exemplo Prático'}</h2>
            <p class="slide-text">${slideData.exemplo_conteudo || ''}</p>
            ${slideData.slide_9_image ? `<div class="slide-image"><img src="${slideData.slide_9_image}" alt="Exemplo prático" /></div>` : ''}
          </div>
        </div>
      `
    });

    // Slide 10 - Conclusão
    slidesList.push({
      id: 10,
      title: slideData.conclusao_titulo || 'Conclusão',
      content: `
        <div class="slide slide-conclusion">
          <div class="slide-content">
            <h2 class="slide-title">${slideData.conclusao_titulo || 'Conclusão'}</h2>
            <p class="slide-text">${slideData.conclusao_conteudo || ''}</p>
          </div>
        </div>
      `
    });

    return slidesList;
  }, [slideData, fallbackHtml]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Nenhum slide disponível</p>
      </div>
    );
  }

  const slideHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Slides</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .slide {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-sizing: border-box;
          color: white;
          text-align: center;
        }
        
        .slide-content {
          max-width: 800px;
          width: 100%;
        }
        
        .slide-main-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0 0 20px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          line-height: 1.1;
        }
        
        .slide-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 30px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          line-height: 1.2;
        }
        
        .slide-subtitle {
          font-size: 1.8rem;
          font-weight: 500;
          margin: 0 0 40px 0;
          opacity: 0.9;
        }
        
        .slide-text {
          font-size: 1.4rem;
          line-height: 1.6;
          margin: 0 0 30px 0;
          text-align: left;
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        
        .slide-list {
          text-align: left;
          font-size: 1.3rem;
          line-height: 1.8;
          background: rgba(255,255,255,0.1);
          padding: 30px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        
        .slide-list li {
          margin: 15px 0;
          padding-left: 10px;
        }
        
        .slide-presenter {
          font-size: 1.2rem;
          font-style: italic;
          opacity: 0.8;
          margin-top: 40px;
        }
        
        .slide-image {
          margin: 30px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .slide-image img {
          max-width: 100%;
          max-height: 400px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          object-fit: contain;
        }
        
        .slide-title {
          background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .slide-development {
          background: linear-gradient(135deg, #a29bfe, #6c5ce7);
        }
        
        .slide-example {
          background: linear-gradient(135deg, #fd79a8, #e84393);
        }
        
        .slide-conclusion {
          background: linear-gradient(135deg, #00b894, #00a085);
        }
        
        @media (max-width: 768px) {
          .slide {
            padding: 20px;
          }
          
          .slide-main-title {
            font-size: 2.5rem;
          }
          
          .slide-title {
            font-size: 2rem;
          }
          
          .slide-subtitle {
            font-size: 1.4rem;
          }
          
          .slide-text {
            font-size: 1.2rem;
          }
          
          .slide-list {
            font-size: 1.1rem;
          }
        }
      </style>
    </head>
    <body>
      ${slides[currentSlide]?.content || ''}
    </body>
    </html>
  `;

  return (
    <div className={`slide-viewer ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative w-full h-full'}`}>
      {/* Navigation Controls */}
      <div className={`absolute top-4 right-4 z-50 flex items-center space-x-2 ${isMobile ? 'scale-75' : ''}`}>
        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentSlide + 1} / {slides.length}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-white/90 backdrop-blur-sm hover:bg-white ${
          isMobile ? 'w-12 h-12' : 'w-10 h-10'
        }`}
      >
        <ChevronLeft className={isMobile ? 'w-6 h-6' : 'w-4 h-4'} />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={nextSlide}
        disabled={currentSlide === slides.length - 1}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white/90 backdrop-blur-sm hover:bg-white ${
          isMobile ? 'w-12 h-12' : 'w-10 h-10'
        }`}
      >
        <ChevronRight className={isMobile ? 'w-6 h-6' : 'w-4 h-4'} />
      </Button>

      {/* Slide Content */}
      <iframe
        srcDoc={slideHtml}
        className="w-full h-full border-none"
        title={`Slide ${currentSlide + 1}`}
        style={{ background: 'transparent' }}
      />

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideViewer;
