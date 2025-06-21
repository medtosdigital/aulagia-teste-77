
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { GeneratedMaterial } from '@/services/materialService';
import SlideViewer from './SlideViewer';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaterialPreviewProps {
  material: GeneratedMaterial;
}

const MaterialPreview: React.FC<MaterialPreviewProps> = ({ material }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (material.content) {
      // Split content into pages based on page breaks or content length
      const contentPages = splitContentIntoPages(material.content);
      setPages(contentPages);
      setCurrentPage(0);
    }
  }, [material.content]);

  const splitContentIntoPages = (content: any): string[] => {
    // Handle different content types
    let htmlContent = '';
    
    if (typeof content === 'string') {
      htmlContent = content;
    } else if (content && typeof content === 'object') {
      // Check if it's an assessment with htmlContent
      if (content.htmlContent && typeof content.htmlContent === 'string') {
        htmlContent = content.htmlContent;
      } else if (content.content && typeof content.content === 'string') {
        htmlContent = content.content;
      } else {
        // Convert object to JSON string as fallback
        htmlContent = `<pre>${JSON.stringify(content, null, 2)}</pre>`;
      }
    }

    // Ensure we have a string to work with
    if (!htmlContent || typeof htmlContent !== 'string') {
      return ['<p>Conteúdo não disponível</p>'];
    }

    // For slides, let SlideViewer handle pagination
    if (material.type === 'slides') {
      return [htmlContent];
    }

    // Check for explicit page breaks
    if (htmlContent.includes('<!-- PAGE_BREAK -->')) {
      return htmlContent.split('<!-- PAGE_BREAK -->').filter(page => page.trim());
    }

    // Auto-split long content into pages (approximate A4 page length)
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const textContent = doc.body.textContent || '';
    
    // If content is short, keep as single page
    if (textContent.length < 2000) {
      return [htmlContent];
    }

    // Split by major sections (h1, h2) or every ~2000 characters
    const sections = htmlContent.split(/(?=<h[12][^>]*>)/);
    const pageSize = 2000;
    const contentPages: string[] = [];
    let currentPageContent = '';

    sections.forEach(section => {
      if ((currentPageContent + section).length > pageSize && currentPageContent) {
        contentPages.push(currentPageContent);
        currentPageContent = section;
      } else {
        currentPageContent += section;
      }
    });

    if (currentPageContent) {
      contentPages.push(currentPageContent);
    }

    return contentPages.length > 0 ? contentPages : [htmlContent];
  };

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // For slides, use SlideViewer
  if (material.type === 'slides') {
    return <SlideViewer htmlContent={material.content} material={material} />;
  }

  const hasMultiplePages = pages.length > 1;

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col relative">
      {/* Page indicator - Only show if multiple pages */}
      {hasMultiplePages && (
        <div className={`bg-white border-b px-4 py-3 flex justify-center items-center ${
          isMobile ? 'text-xl font-bold' : 'text-sm font-medium'
        } text-gray-700`}>
          Página {currentPage + 1} de {pages.length}
        </div>
      )}

      {/* Content area with navigation */}
      <div className="flex-1 relative overflow-hidden">
        {/* Navigation buttons - Only show if multiple pages */}
        {hasMultiplePages && (
          <>
            {/* Previous page button */}
            <Button
              variant="outline"
              size={isMobile ? "lg" : "sm"}
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg border-2 hover:bg-white disabled:opacity-50 ${
                isMobile 
                  ? 'w-16 h-16 rounded-full' 
                  : 'w-10 h-10 rounded-full'
              }`}
            >
              <ChevronLeft className={isMobile ? "h-10 w-10" : "h-5 w-5"} />
            </Button>

            {/* Next page button */}
            <Button
              variant="outline"
              size={isMobile ? "lg" : "sm"}
              onClick={goToNextPage}
              disabled={currentPage === pages.length - 1}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg border-2 hover:bg-white disabled:opacity-50 ${
                isMobile 
                  ? 'w-16 h-16 rounded-full' 
                  : 'w-10 h-10 rounded-full'
              }`}
            >
              <ChevronRight className={isMobile ? "h-10 w-10" : "h-5 w-5"} />
            </Button>
          </>
        )}

        {/* Material content */}
        <div className="w-full h-full overflow-auto p-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg min-h-full">
            <div className="p-8">
              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: pages[currentPage] || '<p>Conteúdo não disponível</p>' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page dots indicator - Only show if multiple pages and on mobile */}
      {hasMultiplePages && isMobile && (
        <div className="bg-white border-t px-4 py-3 flex justify-center gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-4 h-4 rounded-full transition-colors ${
                index === currentPage 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialPreview;
