
import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MaterialPreview from './MaterialPreview';
import { GeneratedMaterial } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import { toast } from 'sonner';

interface MaterialModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ material, open, onClose }) => {
  const getTypeLabel = (type: string): string => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && material) {
      const materialContent = document.querySelector('.material-preview-content')?.innerHTML;
      if (materialContent) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${material.title}</title>
            <style>
              body { margin: 0; padding: 0; font-family: 'Times New Roman', serif; }
              @media print {
                body { margin: 0; padding: 0; }
                .page { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            ${materialContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'ppt') => {
    if (!material) return;

    try {
      switch (format) {
        case 'pdf':
          await exportService.exportToPDF(material);
          toast.success('Material exportado para PDF com sucesso!');
          break;
        case 'word':
          await exportService.exportToWord(material);
          toast.success('Material exportado para Word com sucesso!');
          break;
        case 'ppt':
          await exportService.exportToPPT(material);
          toast.success('Material exportado para PowerPoint com sucesso!');
          break;
      }
    } catch (error) {
      toast.error('Erro ao exportar material');
      console.error('Export error:', error);
    }
  };

  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex">
        <div className="flex-1 overflow-hidden">
          <MaterialPreview material={material} />
        </div>
        
        {/* Sidebar com botões */}
        <div className="w-80 bg-gray-50 border-l flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold">
                Exportar Material
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <Button
              variant="outline"
              size="default"
              onClick={handlePrint}
              className="w-full justify-start"
            >
              <Printer className="h-4 w-4 mr-3" />
              Imprimir
            </Button>
            
            <Button
              variant="outline"
              size="default"
              onClick={() => handleExport('pdf')}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-3" />
              PDF
            </Button>
            
            {material.type !== 'slides' && (
              <Button
                variant="outline"
                size="default"
                onClick={() => handleExport('word')}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-3" />
                Microsoft Word
              </Button>
            )}
            
            {material.type === 'slides' && (
              <Button
                variant="outline"
                size="default"
                onClick={() => handleExport('ppt')}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-3" />
                PPT
              </Button>
            )}
          </div>
          
          <div className="p-6 border-t mt-auto">
            <div className="text-sm text-gray-600 space-y-2">
              <h3 className="font-semibold">Detalhes</h3>
              <div>
                <span className="font-medium">Disciplina:</span> {material.subject}
              </div>
              <div>
                <span className="font-medium">Turma:</span> {material.grade}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {getTypeLabel(material.type)}
              </div>
              <div>
                <span className="font-medium">Criado:</span> {new Date(material.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            <Button
              variant="default"
              onClick={onClose}
              className="w-full mt-6 bg-gray-800 hover:bg-gray-900"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialModal;
