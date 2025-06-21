
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

  const generateAdvancedSlideHTML = (slidesData: any[]): string => {
    const today = new Date().toLocaleDateString('pt-BR');
    
    const slidesHTML = slidesData.map((slide, index) => {
      const slideNumber = index + 1;
      const isFirstSlide = index === 0;
      const isLastSlide = index === slidesData.length - 1;
      
      // Determine slide type based on content
      let slideType = 'normal';
      if (isFirstSlide) slideType = 'title';
      else if (isLastSlide) slideType = 'conclusion';
      else if (slide.table) slideType = 'table';
      else if (slide.imageUrl) slideType = 'image';
      else if (slide.content && slide.content.includes('processo')) slideType = 'process';
      else if (slide.content && slide.content.includes('pergunta')) slideType = 'question';
      
      return generateSlideContent(slide, slideNumber, slideType, today, slidesData.length);
    }).join('\n[QUEBRA_DE_PAGINA]\n');

    return getAdvancedSlideTemplate().replace('{{SLIDES_CONTENT}}', slidesHTML);
  };

  const generateSlideContent = (slide: any, slideNumber: number, slideType: string, date: string, totalSlides: number): string => {
    const shapes = generateShapes(slideNumber);
    const header = generateHeader(slideType, slide.title);
    const footer = generateFooter(date, slideNumber);
    
    let content = '';
    
    switch (slideType) {
      case 'title':
        content = `
          <div class="slide-content centered-content">
            <h2>${slide.title}</h2>
            <h3>Apresentação Educativa</h3>
            <p style="font-size: 1.3rem; margin-top: 30px;">Apresentado por: <br> <strong>Professor(a)</strong></p>
            <p style="font-size: 1rem; color: #666;">AulagIA - Material Educativo</p>
          </div>
        `;
        break;
        
      case 'conclusion':
        content = `
          <div class="slide-content centered-content">
            <h2>OBRIGADO(A)!</h2>
            <p style="font-size: 1.4rem; margin-top: 25px;">Para mais materiais educativos, visite:</p>
            <p style="font-size: 1.8rem; font-weight: 800; color: #FF6B6B; margin-top: 10px;">aulagia.com.br</p>
            <p style="font-size: 1.1rem; margin-top: 40px; color: #666666;">
              Slides gerados pela AulagIA <br>
              Sua aula com toque mágico
            </p>
          </div>
        `;
        break;
        
      case 'table':
        content = `
          <div class="slide-content centered-content">
            <h3>${slide.title}</h3>
            ${slide.table}
            <p style="font-size: 0.95rem; color: #888;">Fonte: Material educativo AulagIA</p>
          </div>
        `;
        break;
        
      case 'image':
        if (slide.imageUrl) {
          content = `
            <div class="slide-content slide-with-image">
              <div class="text-section">
                <h3>${slide.title}</h3>
                <div>${slide.content}</div>
              </div>
              <div class="image-container-lateral">
                <img src="${slide.imageUrl}" alt="${slide.imageAlt}">
                <span class="image-label">${slide.imageAlt || 'Imagem educativa'}</span>
              </div>
            </div>
          `;
        } else {
          content = generateNormalContent(slide);
        }
        break;
        
      case 'process':
        content = `
          <div class="slide-content centered-content">
            <h3>${slide.title}</h3>
            <div class="process-flow">
              <div class="process-step">
                <div class="process-icon">1</div>
                <span class="process-text">Primeira etapa</span>
              </div>
              <span class="process-arrow">→</span>
              <div class="process-step">
                <div class="process-icon">2</div>
                <span class="process-text">Segunda etapa</span>
              </div>
              <span class="process-arrow">→</span>
              <div class="process-step">
                <div class="process-icon">3</div>
                <span class="process-text">Terceira etapa</span>
              </div>
            </div>
            <div>${slide.content}</div>
          </div>
        `;
        break;
        
      case 'question':
        content = `
          <div class="slide-content centered-content" style="background-color: #f8faff; border: 2px dashed #007bff; border-radius: 16px; padding: 50px;">
            <h3 style="color: #007bff; font-size: 3.5rem; margin-bottom: 30px;">Vamos Pensar?</h3>
            <p style="font-size: 1.6rem; line-height: 1.6; font-weight: 500; color: #444; max-width: 80%;">${slide.content}</p>
            <div class="answer-reveal-button" style="background-color: #FF6B6B; color: white; padding: 15px 30px; border-radius: 10px; font-family: 'Poppins', sans-serif; font-size: 1.4rem; font-weight: 700; margin-top: 40px;">
              Clique para pensar!
            </div>
          </div>
        `;
        break;
        
      default:
        content = generateNormalContent(slide);
    }

    return `
      <div class="slide-page">
        ${shapes}
        ${header}
        ${content}
        ${footer}
      </div>
    `;
  };

  const generateNormalContent = (slide: any): string => {
    return `
      <div class="slide-content">
        <h3>${slide.title}</h3>
        <div>${slide.content}</div>
        ${slide.grid || ''}
      </div>
    `;
  };

  const generateShapes = (slideNumber: number): string => {
    const shapeVariations = [
      `<div class="shape-overlay top-left-wave"></div><div class="shape-overlay bottom-right-wave"></div>`,
      `<div class="shape-overlay mid-circle"></div><div class="shape-overlay diagonal-stripe"></div>`,
      `<div class="shape-overlay top-left-wave"></div><div class="shape-overlay mid-circle"></div>`,
      `<div class="shape-overlay bottom-right-wave"></div><div class="shape-overlay mid-circle"></div>`
    ];
    
    return shapeVariations[slideNumber % shapeVariations.length];
  };

  const generateHeader = (slideType: string, title: string): string => {
    const headerTitle = slideType === 'title' ? 'APRESENTAÇÃO' : 
                       slideType === 'conclusion' ? 'FIM' : 
                       slideType === 'question' ? 'INTERAÇÃO' : 
                       'SLIDES';

    return `
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
        <div class="slide-title-header">${headerTitle}</div>
      </div>
    `;
  };

  const generateFooter = (date: string, slideNumber: number): string => {
    return `
      <div class="slide-footer">
        <span class="date">${date}</span>
        <span class="page-number">Slide ${slideNumber}</span>
      </div>
    `;
  };

  const getAdvancedSlideTemplate = (): string => {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Slides AulagIA - Design Avançado e Interativo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');
    
    /* Global Styles */
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

    /* Slide Page - 4:3 Aspect Ratio */
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

    /* Decorative Shapes/Elements */
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
    .shape-overlay.mid-circle {
      width: 150px;
      height: 150px;
      background: #00C9B1;
      border-radius: 50%;
      top: 40%;
      left: -80px;
      opacity: 0.08;
    }
    .shape-overlay.diagonal-stripe {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: linear-gradient(45deg, rgba(0,201,177,0.1) 25%, transparent 25%, transparent 50%, rgba(0,201,177,0.1) 50%, rgba(0,201,177,0.1) 75%, transparent 75%, transparent);
        background-size: 50px 50px;
        z-index: 0;
        opacity: 0.2;
    }

    /* Slide Header */
    .slide-header {
      display: flex;
      justify-content: flex-start;
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
      position: absolute;
      right: 40px;
      font-family: 'Poppins', sans-serif;
      font-size: 26px;
      color: #FF6B6B;
      font-weight: 700;
      text-align: right;
    }

    /* Slide Content */
    .slide-content {
      flex-grow: 1;
      padding: 0 80px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      text-align: left;
      color: #333333;
      z-index: 1;
      font-size: 1.2rem;
    }

    .slide-content.centered-content {
        justify-content: center;
        align-items: center;
        text-align: center;
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

    /* Specific Layouts */
    .slide-with-image {
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
        gap: 40px;
    }
    .slide-with-image .text-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
    }
    .slide-with-image .image-container-lateral {
        flex: 0 0 45%;
        background-color: #f0f2f5;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 12px;
        position: relative;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .slide-with-image .image-container-lateral img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
    }
    .slide-with-image .image-label {
        position: absolute;
        bottom: 15px;
        left: 15px;
        background-color: rgba(0,0,0,0.7);
        color: white;
        padding: 8px 15px;
        border-radius: 8px;
        font-size: 1rem;
        font-family: 'Poppins', sans-serif;
    }

    /* Tables */
    .slide-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 1.05rem;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
    }
    .slide-content th, .slide-content td {
      padding: 15px 22px;
      text-align: left;
      border-bottom: 1px solid #e5e5e5;
    }
    .slide-content th {
      background-color: #00C9B1;
      color: white;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
    }
    .slide-content tr:nth-child(even) {
      background-color: #fdfdfd;
    }
    .slide-content tr:hover {
      background-color: #e6f7f5;
    }

    /* Process Flow / Steps */
    .process-flow {
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        margin-top: 30px;
    }
    .process-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        padding: 15px;
        text-align: center;
    }
    .process-icon {
        width: 80px;
        height: 80px;
        background-color: #FF6B6B;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: 'Poppins', sans-serif;
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 15px;
        box-shadow: 0 5px 15px rgba(255,107,107,0.4);
    }
    .process-arrow {
        font-size: 3rem;
        color: #00C9B1;
        margin: 0 10px;
        align-self: center;
    }

    /* Slide Footer */
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
    .slide-footer .date {
        font-size: 0.85rem;
    }

    /* Print Adjustments */
    @media print {
      body {
        background: white;
      }
      .slide-page {
        box-shadow: none;
        margin: 0;
        border-radius: 0;
        border: none;
      }
      .shape-overlay {
        display: none;
      }
      .slide-header .logo, .slide-header .brand-text h1, .slide-header .brand-text p,
      .slide-content h2, .slide-content h3, .slide-content p, .slide-content ul li,
      .slide-content table, .slide-content th, .slide-content td,
      .process-icon, .slide-footer .page-number, .slide-footer .date {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
      }
      .slide-header .logo {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
      }
      .slide-header .brand-text h1, .slide-content h2, .slide-content p, .slide-content ul li {
          color: #333333 !important;
      }
      .slide-header .slide-title-header {
          color: #FF6B6B !important;
      }
      .slide-content h3 {
          color: #00C9B1 !important;
      }
      .slide-content ul li::before {
          color: #FF6B6B !important;
      }
      .slide-content th {
          background-color: #00C9B1 !important;
      }
      .process-icon {
          background-color: #FF6B6B !important;
          color: white !important;
      }
      .process-arrow {
          color: #00C9B1 !important;
      }
      .slide-footer .page-number { color: #00C9B1 !important; }
      .slide-footer .date { color: #666666 !important; }
    }
  </style>
</head>
<body>
  {{SLIDES_CONTENT}}
</body>
</html>`;
  };

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

  // Generate the complete HTML with all slides using the new template
  const completeSlideHTML = generateAdvancedSlideHTML(slides);

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
      <div className="relative flex justify-center items-center p-4" style={{ minHeight: '576px' }}>
        <iframe
          srcDoc={completeSlideHTML}
          style={{
            width: '100%',
            height: '600px',
            border: 'none',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}
          title="Slides Preview"
        />
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
    </div>
  );
};

export default SlideViewer;
