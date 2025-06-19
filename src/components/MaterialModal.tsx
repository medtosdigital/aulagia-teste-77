
import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MaterialPreview from './MaterialPreview';
import { GeneratedMaterial } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import { templateService } from '@/services/templateService';
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

  const getTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  const handlePrint = () => {
    if (!material) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      try {
        const templateId = getTemplateId(material.type);
        const renderedHtml = templateService.renderTemplate(templateId, material.content);
        
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
              
              .page {
                width: 210mm;
                min-height: 297mm;
                background: white;
                padding: 10mm 20mm 15mm 20mm;
                box-sizing: border-box;
                position: relative;
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.5;
                color: #000;
                page-break-after: always;
              }
              
              .page:last-child {
                page-break-after: avoid;
              }

              .header {
                position: fixed;
                top: 10mm;
                left: 20mm;
                display: flex;
                align-items: center;
                z-index: 10;
              }
              
              .header .logo {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
              }
              
              h1 {
                text-align: center;
                margin: 0 0 30px 0;
                font-size: 18pt;
                font-weight: bold;
                text-transform: uppercase;
              }
              
              h1::after {
                content: '';
                width: 80px;
                height: 3px;
                display: block;
                margin: 10px auto 0;
                border-radius: 2px;
              }
              
              .section-title {
                font-weight: bold;
                margin: 25px 0 15px 0;
                font-size: 14pt;
                text-transform: uppercase;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 11pt;
              }
              
              th, td {
                padding: 8px 12px;
                border: 1px solid #333;
                text-align: left;
                vertical-align: top;
              }
              
              th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: #1f2937;
              }
              
              .header-table th {
                color: white;
                padding: 10px;
                font-weight: bold;
                text-align: center;
              }
              
              ul {
                margin: 0 0 20px 20px;
                padding: 0;
              }
              
              li {
                margin-bottom: 8px;
                text-align: justify;
              }
              
              p {
                text-align: justify;
                margin-bottom: 12px;
              }

              .instructions {
                padding: 15px;
                border-left: 4px solid;
                margin-bottom: 30px;
                font-style: italic;
              }

              .question {
                margin-bottom: 30px;
                page-break-inside: avoid;
              }

              .question-header {
                font-weight: bold;
                margin-bottom: 10px;
                font-size: 13pt;
              }

              .question-text {
                margin-bottom: 15px;
                text-align: justify;
              }

              .options {
                margin-left: 20px;
              }

              .option {
                margin-bottom: 8px;
                display: flex;
                align-items: flex-start;
              }

              .option-letter {
                font-weight: bold;
                margin-right: 10px;
                min-width: 25px;
              }

              .answer-space {
                border-bottom: 1px solid #333;
                height: 40px;
                margin: 10px 0;
              }

              .evaluation-info {
                padding: 15px;
                border-left: 4px solid #dc2626;
                margin-bottom: 30px;
              }

              .points {
                background: #fef2f2;
                color: #dc2626;
                padding: 4px 8px;
                border: 1px solid #dc2626;
                border-radius: 4px;
                font-size: 10pt;
              }

              .footer {
                position: fixed;
                bottom: 10mm;
                left: 20mm;
                right: 20mm;
                text-align: center;
                font-size: 10pt;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
                padding-top: 8px;
              }
            </style>
          </head>
          <body>
            ${renderedHtml}
          </body>
          </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } catch (error) {
        console.error('Erro ao preparar impressão:', error);
        toast.error('Erro ao preparar a impressão');
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
