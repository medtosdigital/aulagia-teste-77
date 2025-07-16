
import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Loader2, Trash2 } from 'lucide-react';
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
import { GeneratedMaterial } from '@/services/materialService';
import { toast } from 'sonner';
import { supabasePlanService } from '@/services/supabasePlanService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SupportContentModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
}

const SupportContentModal: React.FC<SupportContentModalProps> = ({ material, open, onClose }) => {
  const { user } = useAuth();
  const [supportContent, setSupportContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apoios, setApoios] = useState<any[]>([]);
  const [loadingApoios, setLoadingApoios] = useState(false);
  const [apoioToDelete, setApoioToDelete] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Função para buscar apoios vinculados ao material principal
  const fetchApoios = async () => {
    if (!material?.id) return;
    setLoadingApoios(true);
    const { data, error } = await supabase
      .from('materiais_apoio')
      .select('id, titulo, created_at, conteudo')
      .eq('material_principal_id', material.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error && data) setApoios(data);
    setLoadingApoios(false);
  };

  useEffect(() => {
    if (open && material?.id) fetchApoios();
    // eslint-disable-next-line
  }, [open, material?.id]);

  const generateSupportContent = async () => {
    if (!material) {
      toast.error('Material não encontrado para gerar conteúdo de apoio');
      return;
    }
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    setIsGenerating(true);
    try {
      // Consome 1 crédito antes de gerar
      const success = await supabasePlanService.incrementMaterialUsage();
      if (!success) {
        toast.error('Limite de materiais atingido! Faça upgrade para continuar.');
        setIsGenerating(false);
        return;
      }
      // Chamar a IA (edge function) para gerar o conteúdo de apoio
      const tema = material.content.tema || material.content.topic || material.title || '';
      const disciplina = material.content.disciplina || material.content.subject || material.subject || '';
      const turma = material.content.serie || material.content.grade || material.grade || '';
      const titulo = material.content.titulo || material.title || '';
      const objetivos = material.content.objetivos || '';
      
      // Definir tipo do material principal de forma robusta
      let tipo_material_principal = 'plano_aula';
      if (material.content && typeof material.content === 'object') {
        tipo_material_principal = material.content.tipo_material_principal || material.content.tipo_material || material.content.tipo || material.type || 'plano_aula';
      } else if (material.type) {
        tipo_material_principal = material.type;
      }
      
      const { data, error } = await supabase.functions.invoke('gerarMaterialIA', {
        body: {
          materialType: 'apoio',
          formData: {
            tema,
            disciplina,
            serie: turma,
            user_id: user.id,
            material_principal_id: material.id,
            titulo,
            objetivos
          }
        }
      });
      
      if (error || !data || !data.success) {
        console.error('Erro na função gerarMaterialIA:', error, data);
        toast.error('Erro ao gerar conteúdo de apoio');
        setSupportContent(null);
        setIsGenerating(false);
        return;
      }
      
      const conteudoApoio = data.content && typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2);
      
      // Salvar no Supabase
      const disciplinaApoio = material.content.disciplina || material.content.subject || material.subject || '';
      const temaApoio = material.content.tema || material.content.topic || material.title || '';
      const turmaApoio = material.content.serie || material.content.grade || material.grade || '';
      
      const { error: insertError } = await supabase.from('materiais_apoio').insert([
        {
          titulo: titulo || `Apoio - ${tema}`,
          conteudo: conteudoApoio,
          material_principal_id: material.id,
          user_id: user.id,
          disciplina: disciplinaApoio,
          tema: temaApoio,
          turma: turmaApoio
        }
      ]);
      
      if (insertError) {
        console.error('Erro ao inserir no Supabase:', insertError);
        toast.error('Erro ao salvar conteúdo de apoio no banco de dados');
        setSupportContent(null);
        setIsGenerating(false);
        return;
      }
      
      setSupportContent(conteudoApoio);
      toast.success('Conteúdo de apoio gerado e salvo com sucesso!');
      // Atualizar lista de apoios
      fetchApoios();
    } catch (error) {
      console.error('Erro inesperado ao gerar material de apoio:', error);
      toast.error('Erro ao gerar conteúdo de apoio');
      setSupportContent(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para visualizar apoio existente
  const handleViewApoio = (apoio: any) => {
    setSupportContent(apoio.conteudo);
  };

  // Função para baixar PDF usando html2pdf
  const handleDownloadPDF = () => {
    if (!supportContent || !material) return;
    
    // Create a simple HTML structure for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Conteúdo de Apoio - ${material.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { color: #555; }
          p { margin-bottom: 12px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Conteúdo de Apoio ao Professor</h1>
          <p><strong>Material:</strong> ${material.title}</p>
          <p><strong>Disciplina:</strong> ${material.subject} | <strong>Série:</strong> ${material.grade}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="content">
          ${supportContent.replace(/\n/g, '<br/>')}
        </div>
      </body>
      </html>
    `;
    
    // Use html2pdf to generate and download the PDF
    import('html2pdf.js').then(html2pdf => {
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      
      html2pdf.default().from(element).set({
        margin: [15, 15, 15, 15],
        filename: `conteudo-apoio-${material.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save().then(() => {
        toast.success('PDF baixado com sucesso!');
      }).catch((error: any) => {
        console.error('Error generating PDF:', error);
        toast.error('Erro ao gerar PDF');
      });
    }).catch((error) => {
      console.error('Error loading html2pdf:', error);
      toast.error('Erro ao carregar biblioteca de PDF');
    });
  };

  // Função para excluir apoio
  const handleDeleteApoio = (apoio: any) => {
    setApoioToDelete(apoio);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApoio = async () => {
    if (!apoioToDelete) return;
    const { error } = await supabase.from('materiais_apoio').delete().eq('id', apoioToDelete.id);
    if (error) {
      toast.error('Erro ao excluir material de apoio');
    } else {
      toast.success('Material de apoio excluído com sucesso!');
      fetchApoios();
      // Se o apoio excluído estava sendo visualizado, limpa a visualização
      if (supportContent && apoioToDelete.conteudo === supportContent) {
        setSupportContent(null);
      }
    }
    setDeleteDialogOpen(false);
    setApoioToDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Conteúdo de Apoio</span>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={onClose}>
                <X className="w-4 h-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto space-y-4">
            <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              Gere um conteúdo de apoio didático para o tema deste material, explicando e ensinando o assunto de forma clara e acessível para o aluno.
            </div>
            
            <Button 
              onClick={generateSupportContent} 
              disabled={isGenerating} 
              className="w-full" 
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Novo Conteúdo de Apoio'
              )}
              <span className="ml-2 text-xs text-red-500 font-semibold">-1 Crédito</span>
            </Button>
            
            {/* Lista de apoios já criados */}
            <div className="space-y-2">
              <div className="font-semibold text-gray-700">Materiais de Apoio já criados:</div>
              {loadingApoios ? (
                <span className="text-xs text-gray-500">Carregando...</span>
              ) : apoios.length === 0 ? (
                <span className="text-xs text-gray-400">Nenhum material de apoio criado ainda.</span>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {apoios.map(apoio => (
                    <div key={apoio.id} className="bg-gray-50 border border-gray-200 rounded px-3 py-2 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-800 flex items-center gap-2">
                          <span className="inline-block bg-orange-200 text-orange-700 rounded px-2 py-0.5 text-xs font-semibold">Conteúdo de Apoio</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {apoio.created_at ? new Date(apoio.created_at).toLocaleDateString('pt-BR') : ''}
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleViewApoio(apoio)}>
                            <FileText className="w-4 h-4 mr-1" /> Visualizar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteApoio(apoio)} 
                            title="Excluir" 
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Vinculado a este material</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Conteúdo de apoio gerado/visualizado */}
            {supportContent && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Conteúdo de Apoio</h3>
                  <Button 
                    onClick={handleDownloadPDF} 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Baixar PDF
                  </Button>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div 
                    className="prose prose-sm max-w-none"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {supportContent}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este material de apoio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteApoio}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SupportContentModal;
