
import React, { useState } from 'react';
import { X, Download, Edit3, Trash2, Printer, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
}

const SupportMaterialModal: React.FC<SupportMaterialModalProps> = ({ 
  material, 
  open, 
  onClose, 
  onDelete 
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const { canEditMaterials, canDownloadWord } = usePlanPermissions();
  const { openModal: openUpgradeModal } = useUpgradeModal();

  if (!material) return null;

  const handleEdit = () => {
    if (!canEditMaterials()) {
      toast.error('Edição de materiais disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }
    // TODO: Implement edit functionality
    toast.info('Funcionalidade de edição em desenvolvimento');
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
    
    // Convert markdown to HTML
    let conteudoHtml = material.conteudo;
    try {
      const parsed = marked.parse(material.conteudo);
      if (typeof parsed === 'string') conteudoHtml = parsed;
    } catch (error) {
      console.error('Error parsing markdown:', error);
    }

    return String(templateService.renderTemplate('5', {
      titulo: material.titulo || 'Conteúdo de Apoio ao Professor',
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
          filename: `${material.titulo || 'conteudo-apoio'}.pdf`,
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
      a.download = `${material.titulo || 'conteudo-apoio'}.doc`;
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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{material.titulo}</span>
              <div className="flex items-center gap-2">
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
                
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-4 border rounded-lg bg-gray-50">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-4 text-sm text-gray-600">
                <strong>Disciplina:</strong> {material.disciplina} | 
                <strong> Tema:</strong> {material.tema} | 
                <strong> Turma:</strong> {material.turma}
              </div>
              
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: material.conteudo.includes('#') || material.conteudo.includes('**') 
                    ? marked.parse(material.conteudo) 
                    : material.conteudo.replace(/\n/g, '<br/>') 
                }}
              />
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
