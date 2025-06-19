
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
  const handlePrint = () => {
    window.print();
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
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {material.title}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('word')}
              >
                <Download className="h-4 w-4 mr-2" />
                Word
              </Button>
              {material.type === 'slides' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('ppt')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PPT
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <MaterialPreview material={material} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialModal;
