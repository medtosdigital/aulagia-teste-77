import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GeneratedMaterial } from '@/services/materialService';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { supabasePlanService } from '@/services/supabasePlanService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { templateService } from '@/services/templateService';
import { marked } from 'marked';

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

  useEffect(() => {
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
    if (open && material?.id) fetchApoios();
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
      const prompt = undefined; // prompt agora é gerado no edge function
      const titulo = material.content.titulo || material.title || '';
      const objetivos = material.content.objetivos || '';
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
        toast.error('Erro ao gerar conteúdo de apoio');
        setSupportContent(null);
        setIsGenerating(false);
        return;
      }
      setSupportContent(data.content && typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2));
      toast.success('Conteúdo de apoio gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar conteúdo de apoio');
      setSupportContent(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderSupportHtml = () => {
    if (!supportContent || !material) return '';
    const tema = material.content.tema || material.content.topic || material.title || '';
    const disciplina = material.content.disciplina || material.content.subject || material.subject || '';
    const serie = material.content.serie || material.content.grade || material.grade || '';
    const data = new Date().toLocaleDateString('pt-BR');
    // Converter markdown para HTML
    let conteudoHtml = supportContent;
    try {
      conteudoHtml = marked.parse(supportContent);
    } catch {}
    return templateService.renderTemplate('5', {
      titulo: 'Conteúdo de Apoio ao Professor',
      tema,
      disciplina,
      serie,
      conteudo: conteudoHtml,
      data
    });
  };

  const generateSupportContentPDF = () => {
    if (!supportContent || !material) return;
    const html = renderSupportHtml();
    // Usar html2pdf.js para exportar o HTML fiel ao template
    import('html2pdf.js').then(html2pdf => {
      html2pdf.default().from(html).set({
        margin: 0,
        filename: 'conteudo-apoio.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
    });
    toast.success('PDF do conteúdo de apoio baixado com sucesso!');
  };

  const handlePrint = () => {
    if (!supportContent || !material) return;
    const html = renderSupportHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Conteúdo de Apoio</DialogTitle>
          <button className="absolute right-4 top-4" onClick={onClose}><X size={20} /></button>
        </DialogHeader>
        <div className="mb-3 text-sm text-gray-700">
          Gere um conteúdo de apoio didático para o tema deste material, explicando e ensinando o assunto de forma clara e acessível para o aluno.
        </div>
        <Button onClick={generateSupportContent} disabled={isGenerating || !!supportContent} className="w-full mb-2" variant="outline">
          {isGenerating ? 'Gerando...' : 'Gerar Conteúdo de Apoio'}
          <span className="ml-2 text-xs text-red-500 font-semibold">-1 Crédito</span>
        </Button>
        {/* Lista de apoios já criados */}
        <div className="mb-3">
          <div className="font-semibold text-gray-700 mb-1">Materiais de Apoio já criados:</div>
          {loadingApoios ? (
            <span className="text-xs text-gray-500">Carregando...</span>
          ) : apoios.length === 0 ? (
            <span className="text-xs text-gray-400">Nenhum material de apoio criado ainda.</span>
          ) : (
            <ul className="space-y-1">
              {apoios.map(apoio => (
                <li key={apoio.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-2 py-1">
                  <span className="truncate text-sm font-medium">{apoio.titulo || 'Conteúdo de Apoio'} <span className="text-xs text-gray-400 ml-2">{new Date(apoio.created_at).toLocaleDateString('pt-BR')}</span></span>
                  <Button size="sm" variant="ghost" onClick={() => setSupportContent(apoio.conteudo)}>
                    <FileText className="w-4 h-4 mr-1" /> Visualizar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
            <span className="text-sm text-gray-600">Aguarde, gerando conteúdo de apoio...</span>
          </div>
        )}
        {supportContent && (
          <Button onClick={handlePrint} className="w-full mt-3" variant="secondary">
            <Download size={16} className="mr-2" /> Baixar PDF
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportContentModal; 