import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Edit3, ChevronLeft, ChevronRight, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { materialService, type GeneratedMaterial, normalizeMaterialForPreview } from '@/services/materialService';
import { templateService } from '@/services/templateService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import SlideViewer from './SlideViewer';
import { activityService } from '@/services/activityService';
import MaterialModal from './MaterialModal';
import { splitContentIntoPages, enhanceHtmlWithNewTemplate } from '@/services/materialRenderUtils';

interface MaterialInlineEditModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const MaterialInlineEditModal: React.FC<MaterialInlineEditModalProps> = ({
  material,
  open,
  onClose,
  onSave
}) => {
  const isMobile = useIsMobile();
  const [editedMaterial, setEditedMaterial] = useState<GeneratedMaterial | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentHtmlContent, setCurrentHtmlContent] = useState<string>('');
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  useEffect(() => {
    if (material && open) {
      setEditedMaterial(JSON.parse(JSON.stringify(material)));
      setCurrentPage(0);
      setCurrentHtmlContent('');
      setMaterialModalOpen(true);
    }
  }, [material, open]);

  // Function to sync content changes from iframe
  const syncContentChanges = (htmlContent: string) => {
    console.log('Syncing content changes from iframe');
    setCurrentHtmlContent(htmlContent);
    
    if (editedMaterial) {
      // Extract the content from the HTML and update the material
      const updatedMaterial = { ...editedMaterial };
      
      // For now, we'll store the raw HTML content
      // In a more sophisticated implementation, you might parse this back to structured data
      if (typeof updatedMaterial.content === 'string') {
        updatedMaterial.content = htmlContent;
      } else {
        // If content is an object, we need to preserve its structure
        // but update the rendered content
        updatedMaterial.content = {
          ...updatedMaterial.content,
          renderedHtml: htmlContent
        };
      }
      
      setEditedMaterial(updatedMaterial);
      console.log('Material content updated with changes');
    }
  };

  // Make the sync function available to iframe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).syncContentChanges = syncContentChanges;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).syncContentChanges;
      }
    };
  }, [editedMaterial]);

  // Função utilitária para extrair campos editados do HTML do iframe e atualizar o objeto content do material
  function parseEditedHtmlToContent(html: string, originalContent: any, type: string) {
    // Cria um DOM virtual para manipular o HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const updatedContent = { ...originalContent };

    // Exemplo para campos comuns (ajuste conforme o template usado):
    if (type === 'plano-de-aula' || type === 'atividade' || type === 'avaliacao') {
      // Título
      const tituloEl = doc.querySelector('[data-field="titulo"]');
      if (tituloEl) updatedContent.titulo = tituloEl.textContent?.trim() || '';
      // Instruções
      const instrEl = doc.querySelector('[data-field="instrucoes"]');
      if (instrEl) updatedContent.instrucoes = instrEl.textContent?.trim() || '';
      // Objetivos (lista)
      const objetivosEls = doc.querySelectorAll('[data-field="objetivo"]');
      if (objetivosEls.length) {
        updatedContent.objetivos = Array.from(objetivosEls).map(el => el.textContent?.trim() || '');
      }
      // Questões (atividade/avaliação)
      if (type !== 'plano-de-aula') {
        const questoesEls = doc.querySelectorAll('[data-field="questao"]');
        if (questoesEls.length) {
          updatedContent.questoes = Array.from(questoesEls).map((el, idx) => ({
            ...((originalContent.questoes && originalContent.questoes[idx]) || {}),
            pergunta: el.textContent?.trim() || ''
          }));
        }
      }
      // Outros campos podem ser adicionados conforme necessário
    }
    // Slides (exemplo)
    if (type === 'slides') {
      const slidesEls = doc.querySelectorAll('[data-field="slide"]');
      if (slidesEls.length) {
        updatedContent.slides = Array.from(slidesEls).map((el, idx) => ({
          ...((originalContent.slides && originalContent.slides[idx]) || {}),
          conteudo: el.textContent?.trim() || ''
        }));
      }
    }
    return updatedContent;
  }

  const handleSave = async () => {
    if (!editedMaterial) return;

    setLoading(true);
    try {
      let materialToSave = editedMaterial;
      // Se houver HTML editado, parsear para atualizar o objeto content
      if (iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          const html = iframeDoc.documentElement.outerHTML;
          const updatedContent = parseEditedHtmlToContent(html, editedMaterial.content, editedMaterial.type);
        materialToSave = {
          ...editedMaterial,
            content: updatedContent
        };
        }
      }

      const success = await materialService.updateMaterial(materialToSave.id, materialToSave);
      if (success) {
        toast.success('Material atualizado com sucesso!');
        activityService.addActivity({
          type: 'updated',
          title: materialToSave.title,
          description: `Material editado: ${materialToSave.title} (${materialToSave.type})`,
          materialType: materialToSave.type,
          materialId: materialToSave.id,
          subject: materialToSave.subject,
          grade: materialToSave.grade
        });
        onSave();
        onClose();
      } else {
        toast.error('Erro ao atualizar material');
      }
    } catch (error) {
      toast.error('Erro ao salvar material');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  const wrapPageContentWithTemplate = (content: string, isFirstPage: boolean): string => {
    const pageClass = isFirstPage ? 'first-page-content' : 'subsequent-page-content';
    const contentClass = isFirstPage ? 'content' : 'content subsequent-page';
    
    const getFooterText = () => {
      if (editedMaterial?.type === 'plano-de-aula') {
        return `Plano de aula gerado pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      } else if (editedMaterial?.type === 'atividade') {
        return `Atividade gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      } else {
        return `Avaliação gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      }
    };
    
    return `
      <div class="page ${pageClass}">
        <div class="shape-circle purple"></div>
        <div class="shape-circle blue"></div>

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

        <div class="footer">
          ${getFooterText()}
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

  // Função para tornar o conteúdo editável
  const makeContentEditable = (htmlContent: string): string => {
    let editableHtml = htmlContent;

    // Remove qualquer contenteditable/data-field da logo, texto e slogan
    editableHtml = editableHtml.replace(/(<div[^>]*class="logo[^"']*"[^>]*)(contenteditable="true"|data-field="[^"]*")/gi, '$1');
    editableHtml = editableHtml.replace(/(<div[^>]*class="brand-text[^"']*"[^>]*)(contenteditable="true"|data-field="[^"]*")/gi, '$1');
    editableHtml = editableHtml.replace(/(<h1[^>]*>)(AulagIA)(<\/h1>)/gi, '<h1 class="not-editable">$2</h1>');
    editableHtml = editableHtml.replace(/(<p[^>]*>)(Sua aula com toque mágico)(<\/p>)/gi, '<p class="not-editable">$2</p>');
    editableHtml = editableHtml.replace(/(<div[^>]*class="footer[^"']*"[^>]*)(contenteditable="true"|data-field="[^"]*")/gi, '$1');
    editableHtml = editableHtml.replace(/(<footer[^>]*)(contenteditable="true"|data-field="[^"]*")/gi, '$1');

    // Título
    editableHtml = editableHtml.replace(/<h1([^>]*)>/i, function(match, attrs) {
      if (/not-editable/.test(attrs)) return match;
      return `<h1${attrs} contenteditable="true" data-field="titulo">`;
    });
    // Instruções
    editableHtml = editableHtml.replace(/<p([^>]*)>(.*?)Instruções:(.*?)<\/p>/i, function(match, attrs, before, after) {
      if (/not-editable/.test(attrs)) return match;
      return `<p${attrs} contenteditable="true" data-field="instrucoes">${before}Instruções:${after}</p>`;
    });
    // Objetivos (li)
    editableHtml = editableHtml.replace(/<li([^>]*)>(.*?)<\/li>/gi, function(match, attrs, content) {
      if (/not-editable/.test(attrs)) return match;
      if (/objetivo/i.test(content)) {
        return `<li${attrs} contenteditable="true" data-field="objetivo">${content}</li>`;
      }
      if (/OBJETIVO/i.test(editableHtml)) {
        return `<li${attrs} contenteditable="true" data-field="objetivo">${content}</li>`;
      }
      // Habilidades
      if (/habilidade/i.test(content)) {
        return `<li${attrs} contenteditable="true" data-field="habilidade">${content}</li>`;
      }
      if (/HABILIDADE/i.test(editableHtml)) {
        return `<li${attrs} contenteditable="true" data-field="habilidade">${content}</li>`;
      }
      // Recursos
      if (/recurso/i.test(content)) {
        return `<li${attrs} contenteditable="true" data-field="recurso">${content}</li>`;
      }
      if (/RECURSO/i.test(editableHtml)) {
        return `<li${attrs} contenteditable="true" data-field="recurso">${content}</li>`;
      }
      return `<li${attrs} contenteditable="true">${content}</li>`;
    });
    // Desenvolvimento (tabela)
    editableHtml = editableHtml.replace(/<td([^>]*)>(.*?)<\/td>/gi, function(match, attrs, content) {
      if (/not-editable/.test(attrs)) return match;
      return `<td${attrs} contenteditable="true" data-field="desenvolvimento">${content}</td>`;
    });
    // Questões
    editableHtml = editableHtml.replace(/<div([^>]*)class="questao-enunciado"([^>]*)>/gi, function(match, attrs1, attrs2) {
      if (/not-editable/.test(attrs1 + attrs2)) return match;
      return `<div${attrs1} class="questao-enunciado"${attrs2} contenteditable="true" data-field="questao">`;
    });
    // Slides
    editableHtml = editableHtml.replace(/<div([^>]*)class="slide-content"([^>]*)>/gi, function(match, attrs1, attrs2) {
      if (/not-editable/.test(attrs1 + attrs2)) return match;
      return `<div${attrs1} class="slide-content"${attrs2} contenteditable="true" data-field="slide">`;
    });

    // Adiciona contenteditable aos demais campos principais
    editableHtml = editableHtml.replace(/<(h2|h3|h4|h5|h6)([^>]*)>/gi, function(match, tag, attrs) {
      if (/not-editable/.test(attrs)) return match;
      return `<${tag}${attrs} contenteditable="true">`;
    });
    editableHtml = editableHtml.replace(/<p([^>]*)>/gi, function(match, attrs) {
      if (/not-editable/.test(attrs)) return match;
      return `<p${attrs} contenteditable="true">`;
    });

    // Adiciona estilos para destacar campos editáveis e bloquear seleção/edição da logo
    editableHtml = editableHtml.replace('</head>', `
      <style>
        .logo, .brand-text, .not-editable, .footer, footer { pointer-events: none !important; user-select: none !important; -webkit-user-select: none !important; }
        .not-editable { color: #2563eb !important; font-weight: 700 !important; font-size: 2rem !important; letter-spacing: 0.5px; }
        [contenteditable="true"]:hover {
          background-color: rgba(59, 130, 246, 0.08);
          outline: 1.5px dashed #3b82f6;
          cursor: text;
        }
        [contenteditable="true"]:focus {
          background-color: rgba(59, 130, 246, 0.15);
          outline: 2px solid #3b82f6;
          cursor: text;
        }
        [contenteditable="true"] {
          transition: all 0.2s;
          min-height: 1em;
        }
      </style>
    </head>`);

    return editableHtml;
  };

  // Função para envolver o conteúdo com o mesmo container do modal de visualização
  function wrapWithContainer(html: string) {
    // Se já tiver container, não duplica
    if (/<div[^>]*class=["']container["']/.test(html)) return html;
    return `<div class="container">${html}</div>`;
  }

  const renderMaterialWithSameSystem = () => {
    if (!editedMaterial) return null;

    const selectedTemplateId = getDefaultTemplateId(editedMaterial.type);
    try {
      // Mesclar dados do material e do conteúdo para o template
      const templateData = { ...editedMaterial, ...(editedMaterial.content || {}) };
      const renderedHtml = templateService.renderTemplate(selectedTemplateId, templateData);
      
      if (editedMaterial.type === 'slides') {
        return <SlideViewer htmlContent={makeContentEditable(renderedHtml)} material={editedMaterial} />;
      }
      
      // Usar o mesmo sistema de paginação do MaterialPreview
      const pages = splitContentIntoPages(renderedHtml, editedMaterial);
      
      // Sempre aplicar makeContentEditable ao HTML antes de exibir no iframe
      if (pages.length === 1) {
        return (
          <iframe
            ref={iframeRef}
            srcDoc={enhanceHtmlWithNewTemplate(wrapWithContainer(makeContentEditable(pages[0])), editedMaterial)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white',
              overflow: 'visible', // Garante que nada seja cortado
              display: 'block',
              position: 'relative',
              boxSizing: 'border-box',
              margin: 0,
              padding: 0
            }}
            title="Material Editor"
          />
        );
      }

      return (
        <div className="multi-page-container h-full flex flex-col relative">
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

          {isMobile && pages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 w-24 h-24 rounded-full shadow-2xl bg-white/95 backdrop-blur-sm disabled:opacity-30 border-3"
              >
                <ChevronLeft className="w-12 h-12" />
              </Button>

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

          <div className="flex-1 overflow-hidden">
            <iframe
              ref={iframeRef}
              srcDoc={enhanceHtmlWithNewTemplate(wrapWithContainer(makeContentEditable(pages[currentPage])), editedMaterial)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'white',
                overflow: 'visible',
                display: 'block',
                position: 'relative',
                boxSizing: 'border-box',
                margin: 0,
                padding: 0
              }}
              title={`Material Editor - Página ${currentPage + 1}`}
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

  if (!editedMaterial) return null;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl flex-shrink-0">
              <SheetTitle className="text-lg font-bold text-center">
                {editedMaterial.title}
              </SheetTitle>
              <div className="text-sm text-gray-600 text-center">
                Edição • {editedMaterial.subject} • {editedMaterial.grade}
              </div>
            </SheetHeader>
            
            <div className="flex-1 p-4 overflow-hidden">
              <div className="h-full border rounded-2xl bg-gray-50 overflow-hidden shadow-inner">
                <div 
                  className="origin-top-left transform scale-[0.3] w-[333%] h-[333%] overflow-hidden"
                  style={{ transformOrigin: '0 0' }}
                >
                  {renderMaterialWithSameSystem()}
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3 bg-white border-t flex-shrink-0 rounded-b-3xl">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="text-xs rounded-xl"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="text-xs rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // DESKTOP: Ajustar layout da sidebar para seguir o padrão do MaterialModal para todos os tipos de material
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex rounded-2xl">
        <div className="flex-1 overflow-auto rounded-l-2xl bg-white">
          {/* Renderização consistente para todos os tipos de material */}
          <div className="h-full flex flex-col">
            {renderMaterialWithSameSystem()}
          </div>
        </div>
        <div className="w-80 bg-gray-50 border-l flex flex-col rounded-r-2xl">
          <div className="p-6 pb-4 border-b bg-white rounded-tr-2xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Editar Material</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-lg"
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {/* Espaço reservado para futuras opções de edição ou informações */}
          </div>
          <div className="p-6 border-t mt-auto rounded-br-2xl">
            <div className="text-sm text-gray-600 space-y-2 mb-4">
              <h3 className="font-semibold">Detalhes</h3>
              <div>
                <span className="font-medium">Disciplina:</span> {editedMaterial.subject ? editedMaterial.subject.charAt(0).toUpperCase() + editedMaterial.subject.slice(1) : ''}
              </div>
              <div>
                <span className="font-medium">Turma:</span> {editedMaterial.grade}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {getTypeLabel(editedMaterial.type)}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialInlineEditModal;

// Adicione a função auxiliar para obter o label do tipo de material
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'plano-de-aula': 'Plano de Aula',
    'slides': 'Slides',
    'atividade': 'Atividade',
    'avaliacao': 'Avaliação',
  };
  return labels[type] || type;
}
