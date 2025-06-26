
import React from 'react';
import { Crown, Users, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlan } from '@/services/planPermissionsService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  availablePlans: UserPlan[];
  currentPlanName: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  availablePlans,
  currentPlanName
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPlanIcon = (planId: string) => {
    return planId === 'grupo-escolar' ? Users : Crown;
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'professor':
        return 'from-blue-500 to-purple-600';
      case 'grupo-escolar':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto rounded-xl border-0 p-0 sm:p-6">
        <div className="p-6 sm:p-0">
          <DialogHeader className="text-center space-y-4 mb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Limite de Materiais Atingido
            </DialogTitle>
            <DialogDescription className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Você atingiu o limite do seu plano {currentPlanName}. 
              Faça upgrade para continuar criando materiais incríveis!
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {availablePlans.map((plan) => {
              const Icon = getPlanIcon(plan.id);
              const colorClass = getPlanColor(plan.id);

              return (
                <Card key={plan.id} className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 rounded-xl">
                  {plan.id === 'professor' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-blue-500 text-white px-4 py-1 rounded-full">
                        MAIS POPULAR
                      </Badge>
                    </div>
                  )}

                  <div className={`bg-gradient-to-r ${colorClass} p-4 sm:p-6 text-white rounded-t-xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                        <h3 className="text-xl sm:text-2xl font-bold">{plan.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl sm:text-3xl font-bold">
                          {formatPrice(plan.price.monthly)}
                        </div>
                        <div className="text-sm sm:text-base opacity-90">/mês</div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="text-blue-800 font-semibold text-center text-lg sm:text-xl">
                          {plan.limits.materialsPerMonth} materiais por mês
                        </div>
                        {plan.id === 'grupo-escolar' && (
                          <div className="text-blue-600 text-sm sm:text-base text-center mt-1">
                            Para até {plan.limits.maxUsers} professores
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-sm sm:text-base">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>Downloads em PDF, Word e PPT</span>
                        </div>
                        <div className="flex items-center text-sm sm:text-base">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>Edição completa de materiais</span>
                        </div>
                        <div className="flex items-center text-sm sm:text-base">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>Slides interativos</span>
                        </div>
                        <div className="flex items-center text-sm sm:text-base">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>Avaliações personalizadas</span>
                        </div>
                        <div className="flex items-center text-sm sm:text-base">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>Calendário de aulas</span>
                        </div>
                        {plan.id === 'grupo-escolar' && (
                          <>
                            <div className="flex items-center text-sm sm:text-base">
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                              <span>Colaboração entre professores</span>
                            </div>
                            <div className="flex items-center text-sm sm:text-base">
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                              <span>Dashboard de gestão</span>
                            </div>
                            <div className="flex items-center text-sm sm:text-base">
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                              <span>Suporte prioritário</span>
                            </div>
                          </>
                        )}
                      </div>

                      <Button
                        onClick={() => onSelectPlan(plan.id)}
                        className={`w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl ${
                          plan.id === 'professor'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        Escolher {plan.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center px-6 py-3 text-base rounded-xl border-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Continuar com plano atual
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
