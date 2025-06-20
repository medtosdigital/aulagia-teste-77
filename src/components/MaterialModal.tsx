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
                font-family: 'Inter', sans-serif;
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .page {
                width: 210mm;
                min-height: 297mm;
                background: white;
                margin: 0;
                box-sizing: border-box;
                position: relative;
                display: flex;
                flex-direction: column;
                padding: 0;
                border-radius: 0;
                box-shadow: none;
              }

              .shape-circle {
                position: absolute;
                border-radius: 50%;
                opacity: 0.25;
                pointer-events: none;
                z-index: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .shape-circle.purple {
                width: 180px; 
                height: 180px;
                background: #a78bfa;
                top: -60px; 
                left: -40px;
              }
              .shape-circle.blue {
                width: 240px; 
                height: 240px;
                background: #60a5fa;
                bottom: -80px; 
                right: -60px;
              }
              
              .header {
                position: absolute;
                top: 6mm;
                left: 0;
                right: 0;
                display: flex;
                align-items: center;
                z-index: 999;
                height: 12mm;
                background: transparent;
                padding: 0 12mm;
                flex-shrink: 0;
              }
              .header .logo-container {
                display: flex;
                align-items: center;
                gap: 6px;
              }
              .header .logo {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
                box-shadow: 0 2px 6px rgba(14, 165, 233, 0.2);
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header .logo svg {
                width: 14px;
                height: 14px;
                stroke: white;
                fill: none;
                stroke-width: 2;
              }
              .header .brand-text {
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              .header .brand-text h1 {
                font-size: 14px;
                color: #0ea5e9;
                margin: 0;
                font-family: 'Inter', sans-serif;
                line-height: 1;
                font-weight: 700;
                letter-spacing: -0.2px;
                text-transform: none !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header .brand-text p {
                font-size: 7px;
                color: #6b7280;
                margin: 0;
                font-family: 'Inter', sans-serif;
                line-height: 1;
                font-weight: 400;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .content {
                margin-top: 20mm;
                margin-bottom: 12mm;
                padding: 0 15mm;
                position: relative;
                flex: 1;
                overflow: visible;
                z-index: 1;
              }
              
              h2 {
                text-align: center;
                margin: 10px 0 18px 0;
                font-size: 1.5rem;
                color: #4f46e5 !important;
                position: relative;
                font-family: 'Inter', sans-serif;
                font-weight: 700;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              h2::after {
                content: '';
                width: 50px;
                height: 3px;
                background: #a78bfa !important;
                display: block;
                margin: 6px auto 0;
                border-radius: 2px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 18px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              th, td {
                padding: 8px 12px;
                font-size: 0.85rem;
                border: none;
                font-family: 'Inter', sans-serif;
                vertical-align: top;
              }
              th {
                background: #f3f4f6 !important;
                color: #1f2937;
                font-weight: 600;
                text-align: left;
                width: 18%;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              td {
                background: #ffffff;
                border-bottom: 1px solid #e5e7eb;
              }
              td:last-child {
                border-bottom: none;
              }
              
              .section-title {
                font-weight: 600;
                margin-top: 18px;
                margin-bottom: 8px;
                font-size: 1.0rem;
                color: #4338ca !important;
                font-family: 'Inter', sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              ul {
                list-style: disc inside;
                margin-bottom: 16px;
                line-height: 1.4;
                font-size: 0.9rem;
                font-family: 'Inter', sans-serif;
                padding-left: 0;
              }
              li {
                margin-bottom: 0.5mm;
              }
              p {
                font-size: 0.9rem;
                line-height: 1.4;
                margin-bottom: 12px;
                font-family: 'Inter', sans-serif;
                text-align: justify;
              }
              
              .footer {
                position: absolute;
                bottom: 6mm;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 0.7rem;
                color: #6b7280;
                z-index: 999;
                height: 6mm;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                padding: 0 15mm;
                font-family: 'Inter', sans-serif;
                flex-shrink: 0;
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
