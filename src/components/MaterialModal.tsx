import React, { useState } from 'react';
import { X, Download, Printer, FileCheck, Lock } from 'lucide-react';
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
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { activityService } from '@/services/activityService';

interface MaterialModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
  showNextSteps?: boolean; // Nova prop para controlar se deve mostrar o modal de próximos passos
  onEdit?: () => void; // nova prop opcional
}

const MaterialModal: React.FC<MaterialModalProps> = ({ 
  material, 
  open, 
  onClose, 
  showNextSteps = false,
  onEdit
}) => {
  const isMobile = useIsMobile();
  const [answerKeyModalOpen, setAnswerKeyModalOpen] = useState(false);
  const [nextStepsModalOpen, setNextStepsModalOpen] = useState(false);

  // Hooks para gerenciamento de planos
  const { canDownloadWord, canDownloadPPT, canEditMaterials } = usePlanPermissions();
  const { openModal: openUpgradeModal } = useUpgradeModal();

  // Só mostrar o modal de próximos passos se explicitamente solicitado
  React.useEffect(() => {
    if (open && material && showNextSteps) {
      setNextStepsModalOpen(true);
    }
  }, [open, material, showNextSteps]);

  const handleNextStepsClose = () => {
    setNextStepsModalOpen(false);
    onClose();
  };

  const handleNextStepsContinue = () => {
    setNextStepsModalOpen(false);
    // Material continua visível
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

      if (material) {
        activityService.addActivity({
          type: 'exported',
          title: `${material.title}`,
          description: `Material impresso: ${material.title} (${material.type})`,
          materialType: material.type,
          materialId: material.id,
          subject: material.subject,
          grade: material.grade
        });
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast.error('Erro ao preparar a impressão');
    }
  };

  const handleExportPDF = async (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!material) return;

    try {
      console.log('Iniciando exportação PDF para material:', material.type);
      await exportService.exportToPDFDownload(material);
      toast.success('PDF baixado com sucesso!');

      if (material) {
        activityService.addActivity({
          type: 'exported',
          title: `${material.title}`,
          description: `Material exportado em PDF: ${material.title} (${material.type})`,
          materialType: material.type,
          materialId: material.id,
          subject: material.subject,
          grade: material.grade
        });
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleExportWord = async () => {
    if (!material) return;

    // Verificar permissão para download em Word
    if (!canDownloadWord()) {
      toast.error('Download em Word disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    try {
      console.log('Iniciando exportação Word para material:', material.type);
      await exportService.exportToWord(material);
      toast.success('Arquivo Word baixado com sucesso!');

      if (material) {
        activityService.addActivity({
          type: 'exported',
          title: `${material.title}`,
          description: `Material exportado em Word: ${material.title} (${material.type})`,
          materialType: material.type,
          materialId: material.id,
          subject: material.subject,
          grade: material.grade
        });
      }
    } catch (error) {
      console.error('Erro na exportação Word:', error);
      toast.error('Erro ao exportar para Word');
    }
  };

  const handleExportPPT = async () => {
    if (!material) return;

    // Verificar permissão para download em PPT
    if (!canDownloadPPT()) {
      toast.error('Download em PowerPoint disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    try {
      console.log('Iniciando exportação PPT para material:', material.type);
      if (material.type === 'slides') {
        await exportService.exportToPPT(material);
        toast.success('PowerPoint baixado com sucesso!');

        if (material) {
          activityService.addActivity({
            type: 'exported',
            title: `${material.title}`,
            description: `Material exportado em PowerPoint: ${material.title} (${material.type})`,
            materialType: material.type,
            materialId: material.id,
            subject: material.subject,
            grade: material.grade
          });
        }
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

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onClose}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
            <div className="h-full flex flex-col">
              {/* Header */}
              <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl flex-shrink-0">
                <SheetTitle className="text-lg font-bold text-center">
                  {material.title}
                </SheetTitle>
                <div className="text-sm text-gray-600 text-center">
                  {getTypeLabel(material.type)} • {material.subject} • {material.grade}
                </div>
              </SheetHeader>
              
              {/* Content Preview - Scaled down to fit without scrolling */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full border rounded-2xl bg-gray-50 overflow-auto shadow-inner">
                  <div 
                    className="origin-top-left transform scale-[0.3] w-[333%] h-[333%] overflow-hidden"
                    style={{ transformOrigin: '0 0' }}
                  >
                    <MaterialPreview material={material} />
                  </div>
                </div>
              </div>
              
              {/* Export Buttons */}
              <div className="p-4 space-y-3 bg-white border-t flex-shrink-0 rounded-b-3xl">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="text-xs rounded-xl"
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Imprimir
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="text-xs rounded-xl"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  
                  {material.type === 'slides' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPPT}
                      className={`text-xs rounded-xl ${canDownloadPPT() ? '' : 'opacity-50 cursor-not-allowed'}`}
                      disabled={!canDownloadPPT()}
                    >
                      {canDownloadPPT() ? (
                        <Download className="h-3 w-3 mr-1" />
                      ) : (
                        <Lock className="h-3 w-3 mr-1" />
                      )}
                      PPT
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportWord}
                      className={`text-xs rounded-xl ${canDownloadWord() ? '' : 'opacity-50 cursor-not-allowed'}`}
                      disabled={!canDownloadWord()}
                    >
                      {canDownloadWord() ? (
                        <Download className="h-3 w-3 mr-1" />
                      ) : (
                        <Lock className="h-3 w-3 mr-1" />
                      )}
                      Word
                    </Button>
                  )}
                </div>
                
                {/* Answer Key Button */}
                {canGenerateAnswerKey && (
                  <Button
                    variant="outline"
                    onClick={() => setAnswerKeyModalOpen(true)}
                    className="w-full text-green-600 border-green-200 hover:bg-green-50 rounded-xl"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Gerar Gabarito
                  </Button>
                )}
                
                {/* Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className={`w-full text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl ${!canEditMaterials() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canEditMaterials()}
                  title={canEditMaterials() ? 'Editar Material' : 'Edição disponível apenas em planos pagos'}
                >
                  {!canEditMaterials() && <Lock className="w-4 h-4 mr-2 inline" />}Editar Material{!canEditMaterials() && ' (Premium)'}
                </Button>
                
                {/* Close Button */}
                <Button
                  variant="default"
                  onClick={onClose}
                  className="w-full bg-gray-800 hover:bg-gray-900 rounded-xl"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Modal de próximos passos por cima - só se showNextSteps for true */}
        {showNextSteps && (
          <NextStepsModal
            open={nextStepsModalOpen}
            onClose={handleNextStepsClose}
            onContinue={handleNextStepsContinue}
            materialType={material.type}
          />
        )}

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
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex rounded-2xl">
          <div className="flex-1 overflow-auto rounded-l-2xl">
            <MaterialPreview material={material} />
          </div>
          
          {/* Sidebar com botões */}
          <div className="w-80 bg-gray-50 border-l flex flex-col rounded-r-2xl">
            <DialogHeader className="p-6 pb-4 border-b bg-white rounded-tr-2xl">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold">
                  Exportar Material
                </DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-lg"
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
                className="w-full justify-start rounded-lg"
              >
                <Printer className="h-4 w-4 mr-3" />
                Imprimir
              </Button>
              
              <Button
                variant="outline"
                size="default"
                onClick={handleExportPDF}
                className="w-full justify-start rounded-lg"
              >
                <Download className="h-4 w-4 mr-3" />
                PDF
              </Button>
              
              {material.type !== 'slides' && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleExportWord}
                  className={`w-full justify-start rounded-lg ${
                    canDownloadWord() ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!canDownloadWord()}
                >
                  {canDownloadWord() ? (
                    <Download className="h-4 w-4 mr-3" />
                  ) : (
                    <Lock className="h-4 w-4 mr-3" />
                  )}
                  Microsoft Word {!canDownloadWord() && '(Premium)'}
                </Button>
              )}
              
              {material.type === 'slides' && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleExportPPT}
                  className={`w-full justify-start rounded-lg ${
                    canDownloadPPT() ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!canDownloadPPT()}
                >
                  {canDownloadPPT() ? (
                    <Download className="h-4 w-4 mr-3" />
                  ) : (
                    <Lock className="h-4 w-4 mr-3" />
                  )}
                  PPT {!canDownloadPPT() && '(Premium)'}
                </Button>
              )}

              {/* Answer Key Button */}
              {canGenerateAnswerKey && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setAnswerKeyModalOpen(true)}
                  className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50 rounded-lg"
                >
                  <FileCheck className="h-4 w-4 mr-3" />
                  Gerar Gabarito
                </Button>
              )}

              {/* Edit Button */}
              <Button
                variant="outline"
                size="default"
                onClick={onEdit}
                className={`w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg ${!canEditMaterials() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canEditMaterials()}
                title={canEditMaterials() ? 'Editar Material' : 'Edição disponível apenas em planos pagos'}
              >
                {!canEditMaterials() && <Lock className="w-4 h-4 mr-2 inline" />}Editar Material{!canEditMaterials() && ' (Premium)'}
              </Button>
            </div>
            
            <div className="p-6 border-t mt-auto rounded-br-2xl">
              <div className="text-sm text-gray-600 space-y-2">
                <h3 className="font-semibold">Detalhes</h3>
                <div>
                  <span className="font-medium">Disciplina:</span> {material.subject ? material.subject.charAt(0).toUpperCase() + material.subject.slice(1) : ''}
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
                className="w-full mt-6 bg-gray-800 hover:bg-gray-900 rounded-lg"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de próximos passos por cima - só se showNextSteps for true */}
      {showNextSteps && (
        <NextStepsModal
          open={nextStepsModalOpen}
          onClose={handleNextStepsClose}
          onContinue={handleNextStepsContinue}
          materialType={material.type}
        />
      )}

      <AnswerKeyModal 
        material={material}
        open={answerKeyModalOpen}
        onClose={() => setAnswerKeyModalOpen(false)}
      />
    </>
  );
};

export default MaterialModal;
