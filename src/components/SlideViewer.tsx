
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

interface SlideViewerProps {
  htmlContent: string;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ htmlContent }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Extract slides from HTML content
  const slides = React.useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const slideElements = doc.querySelectorAll('.slide');
    
    return Array.from(slideElements).map((slide, index) => {
      const textContent = slide.querySelector('.text-content');
      const imageContent = slide.querySelector('.image-side');
      
      const title = textContent?.querySelector('.title')?.textContent || `Slide ${index + 1}`;
      const content = textContent?.querySelector('.content')?.innerHTML || '';
      const table = textContent?.querySelector('.table')?.outerHTML || '';
      const grid = textContent?.querySelector('.grid')?.outerHTML || '';
      const imageUrl = imageContent?.querySelector('img')?.src || '';
      const imageAlt = imageContent?.querySelector('img')?.alt || '';
      
      return {
        title,
        content,
        table,
        grid,
        imageUrl,
        imageAlt
      };
    });
  }, [htmlContent]);

  const renderSlide = (slide: any, index: number) => {
    const slideNumber = index + 1;
    const isFirstSlide = index === 0;
    const isLastSlide = index === slides.length - 1;
    const today = new Date().toLocaleDateString('pt-BR');
    
    // Determine slide type based on content
    let slideType = 'normal';
    if (isFirstSlide) slideType = 'title';
    else if (isLastSlide) slideType = 'conclusion';
    else if (slide.table) slideType = 'table';
    else if (slide.imageUrl) slideType = 'image';
    else if (slide.content && slide.content.includes('processo')) slideType = 'process';
    else if (slide.content && slide.content.includes('pergunta')) slideType = 'question';

    return (
      <div className="relative w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden border border-gray-200">
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
            {slideType === 'title' ? 'APRESENTAÇÃO' : 
             slideType === 'conclusion' ? 'FIM' : 
             slideType === 'question' ? 'INTERAÇÃO' : 
             'SLIDES'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
          {slideType === 'title' && (
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-bold text-gray-800 leading-tight">{slide.title}</h2>
              <h3 className="text-2xl font-semibold text-teal-600">Apresentação Educativa</h3>
              <div className="mt-8 space-y-3">
                <p className="text-lg text-gray-600">Apresentado por:</p>
                <p className="text-xl font-bold text-gray-800">Professor(a)</p>
                <p className="text-sm text-gray-500">AulagIA - Material Educativo</p>
              </div>
            </div>
          )}

          {slideType === 'conclusion' && (
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

          {slideType === 'table' && (
            <div className="text-center space-y-6">
              <h3 className="text-3xl font-bold text-teal-600 mb-6">{slide.title}</h3>
              <div className="overflow-hidden rounded-xl shadow-md" dangerouslySetInnerHTML={{ __html: slide.table }} />
              <p className="text-sm text-gray-500 mt-4">Fonte: Material educativo AulagIA</p>
            </div>
          )}

          {slideType === 'image' && slide.imageUrl && (
            <div className="flex gap-8 items-center h-full">
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-bold text-teal-600">{slide.title}</h3>
                <div className="text-lg text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: slide.content }} />
              </div>
              <div className="flex-1 max-w-md">
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100">
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.imageAlt}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
                    {slide.imageAlt || 'Imagem educativa'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {slideType === 'process' && (
            <div className="text-center space-y-8">
              <h3 className="text-3xl font-bold text-teal-600">{slide.title}</h3>
              <div className="flex justify-center items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-coral-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">1</div>
                  <span className="mt-3 text-sm font-medium">Primeira etapa</span>
                </div>
                <div className="text-3xl text-teal-600">→</div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-coral-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">2</div>
                  <span className="mt-3 text-sm font-medium">Segunda etapa</span>
                </div>
                <div className="text-3xl text-teal-600">→</div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-coral-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">3</div>
                  <span className="mt-3 text-sm font-medium">Terceira etapa</span>
                </div>
              </div>
              <div className="text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: slide.content }} />
            </div>
          )}

          {slideType === 'question' && (
            <div className="text-center bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-12 space-y-6">
              <h3 className="text-4xl font-bold text-blue-600">Vamos Pensar?</h3>
              <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: slide.content }} />
              <button className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md hover:bg-coral-600 transition-colors">
                Clique para pensar!
              </button>
            </div>
          )}

          {slideType === 'normal' && (
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-teal-600 text-center">{slide.title}</h3>
              <div className="text-lg text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: slide.content }} />
              {slide.grid && <div dangerouslySetInnerHTML={{ __html: slide.grid }} />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-100 text-sm text-gray-600">
          <span>{today}</span>
          <span className="font-semibold text-teal-600">Slide {slideNumber}</span>
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
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Navigation Header */}
      <div className="bg-blue-900 text-white p-4 rounded-t-xl flex items-center justify-between">
        <span className="text-sm font-medium">
          Slide {currentSlide + 1} de {slides.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="text-white hover:bg-blue-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="text-white hover:bg-blue-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="bg-gray-100 p-6 rounded-b-xl">
        <Carousel className="w-full">
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index} className={index === currentSlide ? 'block' : 'hidden'}>
                <div className="aspect-[16/9] w-full">
                  {renderSlide(slide, index)}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Slide Indicators */}
      <div className="bg-blue-900 p-4 rounded-b-xl flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-blue-300 hover:bg-blue-200'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Instructions */}
      <div className="bg-gray-100 p-3 text-center text-sm text-gray-600 rounded-b-lg">
        Use as setas ou clique nos pontos para navegar entre os slides
      </div>
    </div>
  );
};

export default SlideViewer;
