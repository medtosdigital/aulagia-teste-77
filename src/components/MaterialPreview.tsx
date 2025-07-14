import React, { useState } from 'react';
import { templateService } from '@/services/templateService';
import { GeneratedMaterial } from '@/services/materialService';
import SlideViewer from './SlideViewer';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { splitContentIntoPages, enhanceHtmlWithNewTemplate } from '@/services/materialRenderUtils';

interface MaterialPreviewProps {
  material: GeneratedMaterial;
  templateId?: string;
}

const MaterialPreview: React.FC<MaterialPreviewProps> = ({ material, templateId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useIsMobile();

  const getDefaultTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  // Método para criar páginas com o novo template
  const wrapPageContentWithTemplate = (content: string, isFirstPage: boolean): string => {
    const pageClass = isFirstPage ? 'first-page-content' : 'subsequent-page-content';
    const contentClass = isFirstPage ? 'content' : 'content subsequent-page';
    
    // Definir texto do rodapé baseado no tipo de material
    const getFooterText = () => {
      if (material.type === 'plano-de-aula') {
        return `Plano de aula gerado pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      } else if (material.type === 'atividade') {
        return `Atividade gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      } else {
        return `Avaliação gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      }
    };
    
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
          ${getFooterText()}
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

  const renderMaterial = () => {
    // Forçar template padrão para atividades e avaliações
    let selectedTemplateId = templateId;
    if (material.type === 'atividade') selectedTemplateId = '3';
    if (material.type === 'avaliacao') selectedTemplateId = '4';
    if (!selectedTemplateId) selectedTemplateId = getDefaultTemplateId(material.type);
    
    try {
      const renderedHtml = templateService.renderTemplate(selectedTemplateId, material.content);
      
      // Se for slides, usar o SlideViewer com material
      if (material.type === 'slides') {
        return <SlideViewer htmlContent={renderedHtml} material={material} />;
      }
      
      // Split content into pages com o novo sistema
      const pages = splitContentIntoPages(renderedHtml, material);
      
      if (pages.length === 1) {
        // Single page - render directly
        return (
          <iframe
            srcDoc={enhanceHtmlWithNewTemplate(pages[0], material)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white'
            }}
            title="Material Preview"
          />
        );
      }

      // Multiple pages - render with navigation
      return (
        <div className="multi-page-container h-full flex flex-col relative">
          {/* Desktop Navigation Bar */}
          {!isMobile && (
            <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">
                  Página {currentPage + 1} de {pages.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                  disabled={currentPage === pages.length - 1}
                  className="flex items-center space-x-1"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Page Counter - Increased size even more */}
          {isMobile && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl border-2">
              <div className="flex items-center space-x-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-700">
                  {currentPage + 1} / {pages.length}
                </span>
              </div>
            </div>
          )}

          {/* Mobile Floating Navigation Buttons - Increased size even more */}
          {isMobile && pages.length > 1 && (
            <>
              {/* Previous Button - Much larger */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 w-24 h-24 rounded-full shadow-2xl bg-white/95 backdrop-blur-sm disabled:opacity-30 border-3"
              >
                <ChevronLeft className="w-12 h-12" />
              </Button>

              {/* Next Button - Much larger */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50 w-24 h-24 rounded-full shadow-2xl bg-white/95 backdrop-blur-sm disabled:opacity-30 border-3"
              >
                <ChevronRight className="w-12 h-12" />
              </Button>
            </>
          )}

          {/* Page Content */}
          <div className="flex-1 overflow-hidden">
            <iframe
              srcDoc={enhanceHtmlWithNewTemplate(pages[currentPage], material)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'white'
              }}
              title={`Material Preview - Página ${currentPage + 1}`}
            />
          </div>
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar template:', error);
      return (
        <div className="error-message p-4 text-center">
          <p className="text-red-600 text-sm">Erro ao carregar o template do material.</p>
        </div>
      );
    }
  };

  React.useEffect(() => {
    // Injeta CSS global para garantir largura da lacuna no preview
    const style = document.createElement('style');
    style.innerHTML = `.fill-blank { width: 600px !important; min-width: 180px !important; max-width: 600px !important; display: inline-block !important; border-bottom: 2px solid #4338ca !important; height: 1.2em !important; vertical-align: middle !important; margin: 0 4px !important; background: none !important; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="material-preview-container w-full h-full overflow-hidden bg-gray-50">
      <div className="w-full h-full">
        {renderMaterial()}
      </div>
    </div>
  );
};

export default MaterialPreview;
