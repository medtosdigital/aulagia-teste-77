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
import { SUPPORT_MATERIAL_TEMPLATE, replaceTemplateVariables } from '@/services/supportMaterialTemplate';
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
  const [editTitulo, setEditTitulo] = useState('');
  const [editConteudo, setEditConteudo] = useState('');
  const [editDisciplina, setEditDisciplina] = useState('');
  const [editTema, setEditTema] = useState('');
  const [editTurma, setEditTurma] = useState('');
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
    } else {
      // Reset form when material is null
      setEditTitulo('');
      setEditConteudo('');
      setEditDisciplina('');
      setEditTema('');
      setEditTurma('');
    }
    setEditMode(isEditMode);
  }, [material, isEditMode]);

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
        .from('materiais')
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
        .from('materiais')
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
    
    // Verificar se o conteúdo já é HTML completo (template de 5 páginas)
    if (material.conteudo.includes('<!DOCTYPE html') && material.conteudo.includes('.page')) {
      // Já é o template completo, usar como está
      return material.conteudo;
    }
    
    // Se não for o template completo, processar como antes
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
        if (typeof parsed === 'string') {
          conteudoHtml = parsed;
        } else {
          conteudoHtml = material.conteudo.replace(/\n/g, '<br/>');
        }
      } catch (markdownError) {
        console.error('Error parsing markdown:', markdownError);
        conteudoHtml = material.conteudo.replace(/\n/g, '<br/>');
      }
    }

    // Usar template simples para conteúdos antigos
    const simpleTemplate = `
      <div class="page first-page-content">
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
          Conteúdo de Apoio gerado pela AulagIA - Sua aula com toque mágico em ${data} • aulagia.com.br
        </div>
        <div class="content">
          ${conteudoHtml}
        </div>
      </div>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; background: #f0f4f8; font-family: 'Inter', sans-serif; }
        .page { position: relative; width: 210mm; min-height: 297mm; background: white; overflow: hidden; margin: 0 auto 20px auto; box-sizing: border-box; padding: 0; display: flex; flex-direction: column; border-radius: 6px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); page-break-after: always; }
        .shape-circle { position: absolute; border-radius: 50%; opacity: 0.25; pointer-events: none; z-index: 0; }
        .shape-circle.purple { width: 180px; height: 180px; background: #a78bfa; top: -60px; left: -40px; }
        .shape-circle.blue { width: 240px; height: 240px; background: #60a5fa; bottom: -80px; right: -60px; }
        .header { position: absolute; top: 6mm; left: 0; right: 0; display: flex; align-items: center; z-index: 999; height: 15mm; background: transparent; padding: 0 12mm; flex-shrink: 0; }
        .header .logo-container { display: flex; align-items: center; gap: 6px; }
        .header .logo { width: 38px; height: 38px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3); }
        .header .logo svg { width: 20px; height: 20px; stroke: white; fill: none; stroke-width: 2; }
        .header .brand-text { display: flex; flex-direction: column; justify-content: center; }
        .header .brand-text h1 { font-size: 24px; color: #0ea5e9; margin: 0; font-family: 'Inter', sans-serif; line-height: 1; font-weight: 700; letter-spacing: -0.5px; text-transform: none; }
        .header .brand-text p { font-size: 9px; color: #6b7280; margin: 1px 0 0 0; font-family: 'Inter', sans-serif; line-height: 1; font-weight: 400; }
        .content { margin-top: 25mm; margin-bottom: 12mm; padding: 0 15mm; position: relative; flex: 1; overflow: visible; z-index: 1; }
        .footer { position: absolute; bottom: 6mm; left: 0; right: 0; text-align: center; font-size: 0.7rem; color: #6b7280; z-index: 999; height: 6mm; display: flex; align-items: center; justify-content: center; background: transparent; padding: 0 15mm; font-family: 'Inter', sans-serif; flex-shrink: 0; }
        @media print { body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { box-shadow: none; margin: 0; border-radius: 0; width: 100%; min-height: 100vh; display: flex; flex-direction: column; } .shape-circle { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .header, .footer { position: fixed; background: transparent; } .header .logo { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .header .brand-text h1 { text-transform: none !important; } .header .logo svg { width: 20px !important; height: 20px !important; } }
      </style>
    `;
    
    return simpleTemplate;
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

    // Renderizar o HTML do apoio
    return (
      <div className="prose prose-sm max-w-none" style={{ background: '#f8fafc', borderRadius: 12, padding: 0, overflow: 'auto' }}>
        <div dangerouslySetInnerHTML={{ __html: renderSupportHtml() }} />
      </div>
    );
  };

  if (!material) return null;

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
