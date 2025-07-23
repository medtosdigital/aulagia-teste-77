
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollReset = () => {
  const location = useLocation();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  const resetScrollPositions = useCallback(() => {
    // Clear any existing timeout
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    // Immediate reset for all scrollable elements
    const resetElements = () => {
      // Reset window scroll
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      
      // Reset document scroll
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Reset main content container
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
        mainContentRef.current.scrollLeft = 0;
      }
      
      // Reset any other potential scrollable containers
      const scrollableSelectors = [
        '.flex-1',
        '.main-content',
        '.page',
        '.content',
        '[data-radix-scroll-area-viewport]'
      ];
      
      scrollableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.scrollTop = 0;
            element.scrollLeft = 0;
          }
        });
      });
    };

    // Immediate reset
    resetElements();
    
    // Reset after 50ms to handle any delayed rendering
    resetTimeoutRef.current = setTimeout(() => {
      resetElements();
      
      // Final reset after 100ms for edge cases
      resetTimeoutRef.current = setTimeout(() => {
        resetElements();
      }, 100);
    }, 50);
  }, []);

  // Reset scroll on route change
  useEffect(() => {
    resetScrollPositions();
    
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [location.pathname, resetScrollPositions]);

  return { mainContentRef, resetScrollPositions };
};
