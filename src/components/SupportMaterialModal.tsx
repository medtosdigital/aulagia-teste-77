import React, { useState } from 'react';
import { X, Download, Edit3, Trash2, Printer, FileDown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { templateService } from '@/services/templateService';
import { marked } from 'marked';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

interface SupportMaterial {
  id: string;
  titulo: string;
  conteudo: string;
  created_at: string;
  disciplina: string;
  tema: string;
  turma: string;
  material_principal_id: string;
}

interface SupportMaterialModalProps {
  material: SupportMaterial | null;
  open: boolean;
  onClose: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
}

const SupportMaterialModal: React.FC<SupportMaterialModalProps> = ({ 
  material, 
  open, 
  onClose, 
  onDelete,
  isEditMode = false
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(isEditMode);
  
  // Edit form states
  const [editTitulo, setEditTitulo] = useState(material?.titulo || '');
  const [editConteudo, setEditConteudo] = useState(material?.conteudo || '');
  const [editDisciplina, setEditDisciplina] = useState(material?.disciplina || '');
  const [editTema, setEditTema] = useState(material?.tema || '');
  const [editTurma, setEditTurma] = useState(material?.turma || '');
  const [saving, setSaving] = useState(false);

  const { canEditMaterials, canDownloadWord } = usePlanPermissions();
  const { openModal: openUpgradeModal } = useUpgradeModal();

  React.useEffect(() => {
    if (material) {
      setEditTitulo(material.titulo);
      setEditConteudo(material.conteudo);
      setEditDisciplina(material.disciplina);
      setEditTema(material.tema);
      setEditTurma(material.turma || '');
    }
    setEditMode(isEditMode);
  }, [material, isEditMode]);

  if (!material) return null;

  const handleEdit = () => {
    if (!canEditMaterials()) {
      toast.error('Edição de materiais disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!canEditMaterials()) {
      toast.error('Edição de materiais disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('materiais_apoio')
        .update({
          titulo: editTitulo,
          conteudo: editConteudo,
          disciplina: editDisciplina,
          tema: editTema,
          turma: editTurma
        })
        .eq('id', material.id);

      if (error) {
        toast.error('Erro ao salvar alterações');
        return;
      }

      toast.success('Material de apoio atualizado com sucesso!');
      setEditMode(false);
      onClose();
    } catch (error) {
      console.error('Error updating support material:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitulo(material.titulo);
    setEditConteudo(material.conteudo);
    setEditDisciplina(material.disciplina);
    setEditTema(material.tema);
    setEditTurma(material.turma || '');
    setEditMode(false);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('materiais_apoio')
        .delete()
        .eq('id', material.id);

      if (error) {
        toast.error('Erro ao excluir material de apoio');
        return;
      }

      toast.success('Material de apoio excluído com sucesso!');
      setDeleteDialogOpen(false);
      onClose();
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Error deleting support material:', error);
      toast.error('Erro ao excluir material de apoio');
    }
  };

  const renderSupportHtml = () => {
    const data = new Date().toLocaleDateString('pt-BR');
    
    // Processar conteúdo estruturado ou HTML
    let conteudoHtml = material.conteudo;
    
    try {
      // Tentar parsear como JSON estruturado primeiro
      const parsedContent = JSON.parse(material.conteudo);
      if (parsedContent.conteudo_completo) {
        conteudoHtml = parsedContent.conteudo_completo;
      } else {
        // Se não tem conteudo_completo, usar o conteúdo como está
        conteudoHtml = material.conteudo;
      }
    } catch (error) {
      // Se não for JSON, tratar como markdown/texto
      try {
        const parsed = marked.parse(material.conteudo);
        // Handle both sync and async marked.parse results
        if (typeof parsed === 'string') {
          conteudoHtml = parsed;
        } else {
          // If it's a Promise, use original content with line breaks
          conteudoHtml = material.conteudo.replace(/\n/g, '<br/>');
        }
      } catch (markdownError) {
        console.error('Error parsing markdown:', markdownError);
        // Se falhar, usar o conteúdo original com quebras de linha
        conteudoHtml = material.conteudo.replace(/\n/g, '<br/>');
      }
    }

    return String(templateService.renderTemplate('5', {
      titulo: material.titulo || 'Material de Apoio ao Professor',
      tema: material.tema,
      disciplina: material.disciplina,
      serie: material.turma,
      conteudo: conteudoHtml,
      data
    }) || '');
  };

  const handleExport = (format: 'pdf' | 'word' | 'print') => {
    if (format === 'word' && !canDownloadWord()) {
      toast.error('Download em Word disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    const html = renderSupportHtml();
    
    if (format === 'pdf') {
      import('html2pdf.js').then(html2pdf => {
        html2pdf.default().from(html).set({
          margin: 0,
          filename: `${material.titulo || 'material-apoio'}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save();
      });
      toast.success('PDF baixado com sucesso!');
    } else if (format === 'word') {
      // Simple Word export - convert HTML to blob
      const blob = new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${material.titulo || 'material-apoio'}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Documento Word baixado com sucesso!');
    } else if (format === 'print') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
    
    setExportDropdownOpen(false);
  };

  const renderContent = () => {
    if (editMode) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <Input
              value={editTitulo}
              onChange={(e) => setEditTitulo(e.target.value)}
              placeholder="Título do material de apoio"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disciplina</label>
              <Input
                value={editDisciplina}
                onChange={(e) => setEditDisciplina(e.target.value)}
                placeholder="Disciplina"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
              <Input
                value={editTema}
                onChange={(e) => setEditTema(e.target.value)}
                placeholder="Tema"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
              <Input
                value={editTurma}
                onChange={(e) => setEditTurma(e.target.value)}
                placeholder="Turma"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
            <Textarea
              value={editConteudo}
              onChange={(e) => setEditConteudo(e.target.value)}
              placeholder="Conteúdo do material de apoio"
              rows={15}
              className="min-h-[400px]"
            />
          </div>
        </div>
      );
    }

    try {
      // Tentar parsear como JSON estruturado
      const parsedContent = JSON.parse(material.conteudo);
      
      if (parsedContent.conteudo_completo) {
        // Se tem conteudo_completo formatado, usar diretamente
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: parsedContent.conteudo_completo }}
          />
        );
      } else {
        // Se é JSON mas sem conteudo_completo, renderizar as seções individualmente
        return (
          <div className="space-y-6">
            {parsedContent.introducao && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">🎯 Introdução ao Tema</h3>
                <div className="text-gray-700">{parsedContent.introducao}</div>
              </section>
            )}
            
            {parsedContent.objetivos_aprendizagem && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">📚 Objetivos de Aprendizagem</h3>
                <div className="text-gray-700">{parsedContent.objetivos_aprendizagem}</div>
              </section>
            )}
            
            {parsedContent.contextualizacao_teorica && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">🧠 Contextualização Teórica</h3>
                <div className="text-gray-700">{parsedContent.contextualizacao_teorica}</div>
              </section>
            )}
            
            {parsedContent.dicas_pedagogicas && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">🎓 Dicas Pedagógicas</h3>
                <div className="text-gray-700">{parsedContent.dicas_pedagogicas}</div>
              </section>
            )}
            
            {parsedContent.recursos_complementares && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">🛠️ Recursos Complementares</h3>
                <div className="text-gray-700">{parsedContent.recursos_complementares}</div>
              </section>
            )}
            
            {parsedContent.atividades_praticas && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">⚡ Atividades Práticas</h3>
                <div className="text-gray-700">{parsedContent.atividades_praticas}</div>
              </section>
            )}
            
            {parsedContent.perguntas_discussao && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">💭 Perguntas para Discussão</h3>
                <div className="text-gray-700">{parsedContent.perguntas_discussao}</div>
              </section>
            )}
            
            {parsedContent.avaliacao_acompanhamento && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">📊 Avaliação e Acompanhamento</h3>
                <div className="text-gray-700">{parsedContent.avaliacao_acompanhamento}</div>
              </section>
            )}
            
            {parsedContent.referencias && (
              <section>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">📖 Referências</h3>
                <div className="text-gray-700">{parsedContent.referencias}</div>
              </section>
            )}
          </div>
        );
      }
    } catch (error) {
      // Se não for JSON válido, tratar como markdown/texto simples
      const processMarkdown = () => {
        try {
          const parsed = marked.parse(material.conteudo);
          // Handle both sync and async marked.parse results
          if (typeof parsed === 'string') {
            return parsed;
          } else {
            // If it's a Promise, fallback to simple line break replacement
            return material.conteudo.replace(/\n/g, '<br/>');
          }
        } catch (markdownError) {
          console.error('Error parsing markdown:', markdownError);
          return material.conteudo.replace(/\n/g, '<br/>');
        }
      };

      const htmlContent = material.conteudo.includes('#') || material.conteudo.includes('**') 
        ? processMarkdown()
        : material.conteudo.replace(/\n/g, '<br/>');

      return (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editMode ? 'Editando: ' + material.titulo : material.titulo}</span>
              <div className="flex items-center gap-2">
                {editMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="hover:bg-green-50 text-green-600"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      className={canEditMaterials() ? 'hover:bg-blue-50' : 'opacity-50 cursor-not-allowed'}
                      title={canEditMaterials() ? "Editar" : "Edição disponível apenas em planos pagos"}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                        className="hover:bg-green-50"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Exportar
                      </Button>
                      
                      {exportDropdownOpen && (
                        <div className="absolute top-full mt-1 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                          <button
                            onClick={() => handleExport('print')}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                          >
                            <Printer className="w-3 h-3 mr-2" />
                            Imprimir
                          </button>
                          <button
                            onClick={() => handleExport('pdf')}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                          >
                            <FileDown className="w-3 h-3 mr-2" />
                            PDF
                          </button>
                          <button
                            onClick={() => handleExport('word')}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                              canDownloadWord() ? '' : 'opacity-50 cursor-not-allowed'
                            }`}
                            disabled={!canDownloadWord()}
                          >
                            <FileDown className="w-3 h-3 mr-2" />
                            Word {!canDownloadWord() && '(Premium)'}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </>
                )}
                
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-4 border rounded-lg bg-gray-50">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {!editMode && (
                <div className="mb-4 text-sm text-gray-600">
                  <strong>Disciplina:</strong> {material.disciplina} | 
                  <strong> Tema:</strong> {material.tema} | 
                  <strong> Turma:</strong> {material.turma}
                </div>
              )}
              
              {renderContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fechar dropdown quando clicar fora */}
      {exportDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)} />
      )}

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{material.titulo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SupportMaterialModal;
