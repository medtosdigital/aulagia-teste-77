
import React, { useState, useEffect, useRef } from 'react';
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
import { materialService } from '@/services/materialService';

interface SupportContentModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
}

// Função utilitária para template institucional A4 igual ao gabarito
function wrapApoioWithA4Template(apoioHtml: string) {
  const today = new Date().toLocaleDateString('pt-BR');
  return `
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
      Conteúdo de Apoio gerado pela AulagIA - Sua aula com toque mágico em ${today} • aulagia.com.br
    </div>
    <div class="content">
      ${apoioHtml}
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
}

const SupportContentModal: React.FC<SupportContentModalProps> = ({ material, open, onClose }) => {
  const { user } = useAuth();
  const [supportContent, setSupportContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apoios, setApoios] = useState<any[]>([]);
  const [loadingApoios, setLoadingApoios] = useState(false);
  const [apoioToDelete, setApoioToDelete] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const isGeneratingRef = useRef(false);

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
    if (isGeneratingRef.current) return; // Proteção contra duplo disparo
    isGeneratingRef.current = true;
    if (!material) {
      toast.error('Material não encontrado para gerar conteúdo de apoio');
      isGeneratingRef.current = false;
      return;
    }
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      isGeneratingRef.current = false;
      return;
    }
    setIsGenerating(true);
    try {
      // Consome 1 crédito antes de gerar
      const success = await supabasePlanService.incrementMaterialUsage();
      if (!success) {
        toast.error('Limite de materiais atingido! Faça upgrade para continuar.');
        setIsGenerating(false);
        isGeneratingRef.current = false;
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
        isGeneratingRef.current = false;
        return;
      }
      
      // Garante que o conteúdo salvo é sempre HTML renderizado, nunca JSON puro
      let conteudoApoio = '';
      if (data.content && typeof data.content === 'string') {
        conteudoApoio = data.content;
      } else if (data.content && typeof data.content === 'object') {
        // Se vier objeto, tente usar campo 'html' ou similar, ou gere um HTML básico
        if (data.content.html) {
          conteudoApoio = data.content.html;
        } else if (data.content.conteudo) {
          conteudoApoio = data.content.conteudo;
        } else {
          // Fallback: renderiza título e texto se existirem
          conteudoApoio = `<h2>${data.content.titulo || 'Conteúdo de Apoio'}</h2><div>${data.content.texto || ''}</div>`;
        }
      } else {
        conteudoApoio = '';
      }
      
      // Salvar no Supabase
      
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
      isGeneratingRef.current = false;
    }
  };

  // Função para visualizar apoio existente
  const handleViewApoio = (apoio: any) => {
    setSupportContent(apoio.conteudo);
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

  // Função para baixar PDF usando html2pdf
  const handleDownloadPDF = () => {
    if (!supportContent) return;
    const element = pdfContentRef.current;
    if (!element) return;
    const html = wrapApoioWithA4Template(supportContent);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    import('html2pdf.js').then(html2pdf => {
      html2pdf.default().from(tempDiv).set({
        margin: [0, 0, 0, 0],
        filename: `conteudo-apoio.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="max-w-4xl w-full sm:w-[95vw] max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl sm:rounded-2xl p-2 sm:p-6"
          style={{ borderRadius: '1.25rem' }}
        >
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
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Baixar PDF
                  </Button>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div 
                    ref={pdfContentRef}
                    className="prose prose-sm max-w-none"
                    style={{ whiteSpace: 'normal' }}
                    dangerouslySetInnerHTML={{ __html: wrapApoioWithA4Template(supportContent) }}
                  />
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
