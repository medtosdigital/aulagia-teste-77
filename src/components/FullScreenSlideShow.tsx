import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GeneratedMaterial } from '@/services/materialService';

interface FullScreenSlideShowProps {
  material: GeneratedMaterial;
  onClose: () => void;
}

const FullScreenSlideShow: React.FC<FullScreenSlideShowProps> = ({ material, onClose }) => {
  console.log('[FullScreenSlideShow] Renderizando apresentação para material:', material);
  const [current, setCurrent] = useState(0);
  const [showArrows, setShowArrows] = useState(true);
  const [lastMove, setLastMove] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Extrai slides do htmlContent
  const slides = React.useMemo(() => {
    if (!material?.content?.htmlContent) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(material.content.htmlContent, 'text/html');
    const slideDivs = doc.querySelectorAll('div.slide');
    return Array.from(slideDivs).map(div => div.outerHTML);
  }, [material]);

  // Navegação por teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrent(c => Math.min(c + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrent(c => Math.max(c - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length, onClose]);

  // Mostrar setas ao mover mouse
  useEffect(() => {
    const show = () => {
      setShowArrows(true);
      setLastMove(Date.now());
    };
    const hide = () => setShowArrows(false);
    const onMove = () => show();
    window.addEventListener('mousemove', onMove);
    const interval = setInterval(() => {
      if (showArrows && Date.now() - lastMove > 2000) hide();
    }, 500);
    return () => {
      window.removeEventListener('mousemove', onMove);
      clearInterval(interval);
    };
  }, [showArrows, lastMove]);

  if (!slides.length) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-label="Apresentação de Slides"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        overflow: 'hidden',
        padding: 0,
        margin: 0,
      }}
    >
      {/* Botão fechar discreto no topo direito */}
      <button
        aria-label="Fechar apresentação"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 32,
          background: 'rgba(255,255,255,0.85)',
          color: '#222',
          border: 'none',
          borderRadius: 999,
          padding: '8px 16px',
          fontWeight: 700,
          fontSize: 18,
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
          zIndex: 10000,
          cursor: 'pointer',
        }}
      >
        <X className="inline -mt-1 mr-1" size={22} /> Fechar
      </button>
      {/* Setas laterais grandes */}
      {showArrows && current > 0 && (
        <button
          aria-label="Slide anterior"
          onClick={() => setCurrent(c => Math.max(c - 1, 0))}
          style={{
            position: 'absolute',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.85)',
            color: '#222',
            border: 'none',
            borderRadius: 999,
            padding: '16px 20px',
            fontWeight: 700,
            fontSize: 32,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
            zIndex: 10000,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={48} />
        </button>
      )}
      {showArrows && current < slides.length - 1 && (
        <button
          aria-label="Próximo slide"
          onClick={() => setCurrent(c => Math.min(c + 1, slides.length - 1))}
          style={{
            position: 'absolute',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.85)',
            color: '#222',
            border: 'none',
            borderRadius: 999,
            padding: '16px 20px',
            fontWeight: 700,
            fontSize: 32,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
            zIndex: 10000,
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={48} />
        </button>
      )}
      {/* Slide ocupa 100vw x 100vh, sem borda/sombra */}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
        dangerouslySetInnerHTML={{ __html: slides[current] }}
      />
    </div>
  );
};

export default FullScreenSlideShow; 