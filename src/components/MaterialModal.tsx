import React, { useState } from 'react';
import { X, Download, Printer, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import MaterialPreview from './MaterialPreview';
import AnswerKeyModal from './AnswerKeyModal';
import NextStepsModal from './NextStepsModal';
import { GeneratedMaterial } from '@/services/materialService';
import { templateService } from '@/services/templateService';
import { exportService } from '@/services/exportService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaterialModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ material, open, onClose }) => {
  const isMobile = useIsMobile();
  const [answerKeyModalOpen, setAnswerKeyModalOpen] = useState(false);
  const [nextStepsModalOpen, setNextStepsModalOpen] = useState(false);
  const [showMaterialPreview, setShowMaterialPreview] = useState(false);

  // Quando o modal principal abrir, mostrar primeiro o modal de próximos passos
  React.useEffect(() => {
    if (open && material && !showMaterialPreview) {
      setNextStepsModalOpen(true);
    }
  }, [open, material, showMaterialPreview]);

  const handleNextStepsClose = () => {
    setNextStepsModalOpen(false);
    onClose();
    setShowMaterialPreview(false);
  };

  const handleNextStepsContinue = () => {
    setNextStepsModalOpen(false);
    setShowMaterialPreview(true);
  };

  const handleMainModalClose = () => {
    onClose();
    setShowMaterialPreview(false);
  };

  const getTypeLabel = (type: string): string => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handlePrint = async () => {
    if (!material) return;

    try {
      console.log('Iniciando impressão para material:', material.type);
      await exportService.exportToPDF(material);
      toast.success('Material enviado para impressão!');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast.error('Erro ao preparar a impressão');
    }
  };

  const handleExportPDF = async () => {
    if (!material) return;

    try {
      console.log('Iniciando exportação PDF para material:', material.type);
      await exportService.exportToPDF(material);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleExportWord = async () => {
    if (!material) return;

    try {
      console.log('Iniciando exportação Word para material:', material.type);
      await exportService.exportToWord(material);
      toast.success('Arquivo Word baixado com sucesso!');
    } catch (error) {
      console.error('Erro na exportação Word:', error);
      toast.error('Erro ao exportar para Word');
    }
  };

  const handleExportPPT = async () => {
    if (!material) return;

    try {
      console.log('Iniciando exportação PPT para material:', material.type);
      if (material.type === 'slides') {
        await exportService.exportToPPT(material);
        toast.success('PowerPoint baixado com sucesso!');
      } else {
        await exportService.exportToPDF(material);
        toast.success('Material exportado como PDF!');
      }
    } catch (error) {
      console.error('Erro ao exportar PPT:', error);
      toast.error('Erro ao exportar PowerPoint');
    }
  };

  const canGenerateAnswerKey = material && (material.type === 'atividade' || material.type === 'avaliacao');

  if (!material) return null;

  // Modal de próximos passos
  if (nextStepsModalOpen) {
    return (
      <NextStepsModal
        open={nextStepsModalOpen}
        onClose={handleNextStepsClose}
        onContinue={handleNextStepsContinue}
        materialType={material.type}
      />
    );
  }

  // Só mostrar o modal principal se showMaterialPreview for true
  if (!showMaterialPreview) return null;

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onClose}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
            <div className="h-full flex flex-col">
              {/* Header */}
              <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl">
                <SheetTitle className="text-lg font-bold text-center">
                  {material.title}
                </SheetTitle>
                <div className="text-sm text-gray-600 text-center">
                  {getTypeLabel(material.type)} • {material.subject} • {material.grade}
                </div>
              </SheetHeader>
              
              {/* Content Preview - Scaled down to fit without scrolling */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full border rounded-2xl bg-gray-50 overflow-hidden shadow-inner">
                  <div 
                    className="origin-top-left transform scale-[0.3] w-[333%] h-[333%] overflow-hidden"
                    style={{ transformOrigin: '0 0' }}
                  >
                    <MaterialPreview material={material} />
                  </div>
                </div>
              </div>
              
              {/* Export Buttons */}
              <div className="p-4 space-y-3 bg-white border-t">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="text-xs"
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Imprimir
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  
                  {material.type === 'slides' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPPT}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PPT
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportWord}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Word
                    </Button>
                  )}
                </div>
                
                {/* Answer Key Button */}
                {canGenerateAnswerKey && (
                  <Button
                    variant="outline"
                    onClick={() => setAnswerKeyModalOpen(true)}
                    className="w-full text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Gerar Gabarito
                  </Button>
                )}
                
                {/* Close Button */}
                <Button
                  variant="default"
                  onClick={onClose}
                  className="w-full bg-gray-800 hover:bg-gray-900"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AnswerKeyModal 
          material={material}
          open={answerKeyModalOpen}
          onClose={() => setAnswerKeyModalOpen(false)}
        />
      </>
    );
  }

  // Desktop layout
  return (
    <>
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
                onClick={handleExportPDF}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-3" />
                PDF
              </Button>
              
              {material.type !== 'slides' && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleExportWord}
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
                  onClick={handleExportPPT}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-3" />
                  PPT
                </Button>
              )}

              {/* Answer Key Button */}
              {canGenerateAnswerKey && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setAnswerKeyModalOpen(true)}
                  className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                >
                  <FileCheck className="h-4 w-4 mr-3" />
                  Gerar Gabarito
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

      <AnswerKeyModal 
        material={material}
        open={answerKeyModalOpen}
        onClose={() => setAnswerKeyModalOpen(false)}
      />
    </>
  );
};

export default MaterialModal;
