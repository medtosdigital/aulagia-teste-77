
import React from 'react';
import { MessageCircle, Clock, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName: string;
  remainingDays?: number;
}

const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  currentPlanName,
  remainingDays = 15
}) => {
  const handleContactSupport = () => {
    // Aqui você pode implementar a lógica para contatar o suporte
    // Por exemplo, abrir um chat, enviar email, etc.
    window.open('mailto:suporte@aulagia.com?subject=Limite de Materiais Atingido&body=Olá, atingi o limite de materiais do meu plano Professor e gostaria de suporte.', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] rounded-xl border-0 p-0">
        <div className="p-6">
          <DialogHeader className="text-center space-y-3 mb-6">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Limite de Materiais Atingido
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Você atingiu o limite mensal do seu plano {currentPlanName} (60 materiais/mês).
            </DialogDescription>
          </DialogHeader>

          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">
                    Limite será renovado em breve
                  </h4>
                  <p className="text-sm text-amber-700">
                    Seu limite de materiais será renovado automaticamente no próximo ciclo de faturamento 
                    (aproximadamente {remainingDays} dias).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">
                Precisa de mais materiais agora?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Entre em contato com nosso suporte para avaliar suas opções.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleContactSupport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contatar Suporte
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Entendi, vou aguardar
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span>Nosso suporte responde em até 24 horas</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;
