
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
      // Capturar todo o conteúdo da visualização A4
      const materialContent = document.querySelector('.a4-document-container')?.outerHTML || 
                            document.querySelector('.material-preview-content')?.innerHTML;
      
      if (materialContent) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${material.title}</title>
            <meta charset="utf-8">
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Times New Roman', serif;
                background: white;
              }
              
              .a4-document-container {
                display: block;
                padding: 0;
                gap: 0;
              }
              
              .a4-page {
                width: 210mm;
                min-height: 297mm;
                background: white;
                padding: 2.5cm 3cm 2cm 3cm;
                margin: 0;
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.5;
                color: #333;
                page-break-after: always;
                box-shadow: none;
                border-radius: 0;
              }
              
              .a4-page:last-child {
                page-break-after: avoid;
              }
              
              h1 {
                font-size: 16pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 2rem;
                text-transform: uppercase;
                color: #1e40af;
              }
              
              h2 {
                font-size: 14pt;
                font-weight: bold;
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                color: #1e40af;
                text-transform: uppercase;
              }
              
              h3 {
                font-size: 12pt;
                font-weight: bold;
                margin-top: 1rem;
                margin-bottom: 0.5rem;
                color: #374151;
              }
              
              p {
                margin-bottom: 1rem;
                text-align: justify;
                text-indent: 1.25cm;
              }
              
              ul, ol {
                margin-bottom: 1rem;
                padding-left: 1.5rem;
              }
              
              li {
                margin-bottom: 0.5rem;
                text-align: justify;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
                font-size: 11pt;
              }
              
              th, td {
                border: 1px solid #d1d5db;
                padding: 8px 12px;
                text-align: left;
              }
              
              th {
                background-color: #f3f4f6;
                font-weight: bold;
                text-align: center;
              }
              
              .lesson-info-table {
                border: 2px solid #1e40af;
                margin: 2rem 0;
              }
              
              .lesson-info-table th {
                background-color: #dbeafe;
                color: #1e40af;
                font-weight: bold;
              }
              
              .question-block {
                margin: 1.5rem 0;
                padding: 1rem;
                border-left: 4px solid #1e40af;
                background-color: #f8fafc;
              }
              
              .question-number {
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 0.5rem;
              }
              
              .question-options {
                margin-left: 1rem;
                margin-top: 0.5rem;
              }
              
              .question-options li {
                list-style-type: lower-alpha;
                margin-bottom: 0.25rem;
              }
            </style>
          </head>
          <body>
            ${materialContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        
        // Aguardar um pouco para garantir que o conteúdo foi carregado antes de imprimir
        setTimeout(() => {
          printWindow.print();
        }, 500);
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
