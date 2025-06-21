
import React from 'react';
import { CheckCircle, Calendar, Download, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';

interface NextStepsModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  materialType: string;
}

const NextStepsModal: React.FC<NextStepsModalProps> = ({ 
  open, 
  onClose, 
  onContinue, 
  materialType 
}) => {
  const isMobile = useIsMobile();

  const getTypeLabel = (type: string): string => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const steps = [
    {
      number: 1,
      title: "Revisar e Editar",
      description: "Revise o conteúdo gerado e faça quaisquer ajustes necessários",
      icon: <Edit className="h-5 w-5" />
    },
    {
      number: 2,
      title: "Salvar Aula",
      description: "Salve sua aula na biblioteca para acesso futuro",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      number: 3,
      title: "Agendar Aula",
      description: "Use o calendário para agendar quando esta aula será ministrada",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      number: 4,
      title: "Exportar",
      description: "Exporte como PDF ou Word para uso offline",
      icon: <Download className="h-5 w-5" />
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${
        isMobile 
          ? 'w-[95vw] h-[90vh] max-w-none max-h-none m-2 rounded-2xl' 
          : 'max-w-md rounded-xl'
      } p-0 overflow-hidden flex flex-col`}>
        
        {/* Header fixo */}
        <DialogHeader className={`flex-shrink-0 p-4 pb-3 border-b bg-white ${
          isMobile ? 'rounded-t-2xl' : 'rounded-t-xl'
        }`}>
          <DialogTitle className={`text-center text-gray-800 font-bold ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            Material Gerado com Sucesso!
          </DialogTitle>
        </DialogHeader>
        
        {/* Conteúdo scrollável */}
        <div className={`flex-1 overflow-y-auto p-4 ${isMobile ? 'pb-2' : 'p-6'}`}>
          <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            
            {/* Alert de aviso */}
            <Alert className="border-amber-200 bg-amber-50 rounded-xl">
              <AlertTriangle className={`text-amber-600 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <AlertDescription className={`text-amber-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <strong>Importante:</strong> Sempre revise o conteúdo gerado antes de usar em sala de aula. 
                A IA pode cometer erros ou gerar informações imprecisas.
              </AlertDescription>
            </Alert>

            {/* Tipo do material */}
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Tipo de material criado:
              </p>
              <p className={`font-semibold text-blue-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
                {getTypeLabel(materialType)}
              </p>
            </div>

            {/* Próximos passos */}
            <div>
              <h3 className={`font-semibold text-gray-800 mb-3 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                Próximos Passos
              </h3>
              <div className={`space-y-3 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center ${
                      isMobile ? 'w-6 h-6' : 'w-8 h-8'
                    }`}>
                      <span className={`font-semibold text-blue-600 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {step.number}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`text-blue-600 ${isMobile ? '[&>svg]:w-3 [&>svg]:h-3' : ''}`}>
                          {step.icon}
                        </div>
                        <h4 className={`font-medium text-gray-800 ${
                          isMobile ? 'text-sm' : 'text-base'
                        }`}>
                          {step.title}
                        </h4>
                      </div>
                      <p className={`text-gray-600 break-words ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botões fixos no rodapé */}
        <DialogFooter className={`flex-shrink-0 p-4 pt-2 border-t bg-white ${
          isMobile ? 'rounded-b-2xl' : 'rounded-b-xl'
        }`}>
          <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
            <Button
              variant="outline"
              onClick={onClose}
              className={`border-gray-300 rounded-lg ${
                isMobile ? 'w-full h-10 text-sm' : 'w-full sm:w-auto'
              }`}
            >
              Cancelar
            </Button>
            <Button
              onClick={onContinue}
              className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg ${
                isMobile ? 'w-full h-10 text-sm' : 'w-full sm:w-auto'
              }`}
            >
              Visualizar Material
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NextStepsModal;
