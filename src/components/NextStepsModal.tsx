
import React from 'react';
import { CheckCircle, Calendar, Download, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gray-800">
            Material Gerado com Sucesso!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Alert de aviso */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Importante:</strong> Sempre revise o conteúdo gerado antes de usar em sala de aula. 
              A IA pode cometer erros ou gerar informações imprecisas.
            </AlertDescription>
          </Alert>

          {/* Tipo do material */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tipo de material criado:</p>
            <p className="font-semibold text-blue-700">{getTypeLabel(materialType)}</p>
          </div>

          {/* Próximos passos */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Próximos Passos</h3>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.number} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{step.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="text-blue-600">{step.icon}</div>
                      <h4 className="font-medium text-gray-800">{step.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onContinue}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Visualizar Material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NextStepsModal;
