import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Nenhum slide encontrado
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full bg-[#e0f2fe] rounded-lg overflow-hidden">
      {/* Navigation Header */}
      <div className="bg-[#1e3a8a] text-white p-4 flex items-center justify-between">
        <span className="text-sm font-medium">
          Slide {currentSlide + 1} de {slides.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            disabled={slides.length <= 1}
            className="text-white hover:bg-blue-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            disabled={slides.length <= 1}
            className="text-white hover:bg-blue-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="relative">
        <div 
          className="slide bg-white mx-auto flex items-center justify-between p-10 box-border"
          style={{
            width: '960px',
            height: '720px',
            maxWidth: '100%',
            transform: 'scale(0.8)',
            transformOrigin: 'center top'
          }}
        >
          <div className="text-content w-[55%]">
            <div 
              className="title text-4xl font-bold text-[#0f172a] mb-5"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              {currentSlideData.title}
            </div>
            {currentSlideData.content && (
              <div 
                className="content text-xl text-[#1e293b] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentSlideData.content }}
              />
            )}
            {currentSlideData.table && (
              <div 
                className="mt-5"
                dangerouslySetInnerHTML={{ __html: currentSlideData.table }}
              />
            )}
            {currentSlideData.grid && (
              <div 
                className="mt-5"
                dangerouslySetInnerHTML={{ __html: currentSlideData.grid }}
              />
            )}
          </div>
          {currentSlideData.imageUrl && (
            <div className="image-side">
              <img 
                src={currentSlideData.imageUrl} 
                alt={currentSlideData.imageAlt}
                className="w-[280px] max-w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="bg-[#1e3a8a] p-4 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
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
      <div className="bg-gray-100 p-3 text-center text-sm text-gray-600">
        Use as setas ou clique nos pontos para navegar entre os slides
      </div>

      <style>{`
        .slide .table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }
        .slide .table th, .slide .table td {
          border: 1px solid #ccc;
          padding: 10px 14px;
          font-size: 1.1rem;
          text-align: center;
        }
        .slide .table th {
          background-color: #f3f4f6;
        }
        .slide .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 20px;
        }
        .slide .box {
          background-color: #fef9c3;
          padding: 16px;
          border-radius: 10px;
          font-size: 1.2rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default SlideViewer;
