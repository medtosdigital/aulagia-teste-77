import React, { useState } from 'react';
import { Crown, Users, Check, X, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
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
  const getYearlyDiscount = (plan: UserPlan) => {
    const monthlyTotal = plan.price.monthly * 12;
    if (monthlyTotal === 0) return 0;
    return Math.round((monthlyTotal - plan.price.yearly) / monthlyTotal * 100);
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto rounded-xl border-0 p-0">
        <div className="p-3 sm:p-4">
          <DialogHeader className="text-center space-y-2 mb-3">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Acesso Limitado</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Você atingiu o limite do seu plano {currentPlanName}. 
              Faça upgrade para continuar criando materiais incríveis!
            </DialogDescription>
          </DialogHeader>

          {/* Billing Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2 sm:gap-3 mb-4">
            <span className="text-sm font-medium text-gray-500 text-center sm:text-left">Faturamento:</span>
            <div className="bg-white rounded-full p-1 shadow-sm border-2 w-fit mx-auto sm:mx-0">
              <button onClick={() => setBillingType('monthly')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${billingType === 'monthly' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                Mensal
              </button>
              <button onClick={() => setBillingType('yearly')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${billingType === 'yearly' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                Anual
              </button>
            </div>
            {billingType === 'yearly' && <Badge className="bg-green-100 text-green-800 text-xs rounded-full mx-auto sm:mx-0">
                <Star className="w-3 h-3 mr-1" />
                Economize até 20%
              </Badge>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
            {availablePlans.map(plan => {
            const Icon = getPlanIcon(plan.id);
            const colorClass = getPlanColor(plan.id);
            const price = billingType === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const yearlyDiscount = getYearlyDiscount(plan);
            return <Card key={plan.id} className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 rounded-xl">
                  {plan.id === 'professor' && <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                        MAIS POPULAR
                      </Badge>
                    </div>}

                  <div className={`bg-gradient-to-r ${colorClass} p-3 text-white rounded-t-xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-2" />
                        <h3 className="text-base sm:text-lg font-bold">{plan.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-bold">
                          {formatPrice(price)}
                        </div>
                        <div className="text-xs opacity-90">
                          {billingType === 'monthly' ? '/mês' : '/ano'}
                        </div>
                        {billingType === 'yearly' && yearlyDiscount > 0 && <div className="text-xs opacity-75">
                            {yearlyDiscount}% off
                          </div>}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <div className="text-blue-800 font-semibold text-center text-sm sm:text-base">
                          {plan.limits.materialsPerMonth} materiais por mês
                        </div>
                        {plan.id === 'grupo-escolar' && <div className="text-blue-600 text-xs text-center mt-1">
                            Para até {plan.limits.maxUsers} professores
                          </div>}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center text-xs">
                          <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>Downloads em PDF, Word e PPT</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>Edição completa de materiais</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>Slides interativos</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>Avaliações personalizadas</span>
                        </div>
                        {plan.id === 'grupo-escolar' && <div className="flex items-center text-xs">
                            <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            <span>Colaboração entre professores</span>
                          </div>}
                      </div>

                      <Button onClick={() => onSelectPlan(plan.id)} className={`w-full py-2 text-sm font-semibold rounded-xl ${plan.id === 'professor' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        Escolher {plan.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>

          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={onClose} className="flex items-center px-4 py-2 text-sm rounded-xl border-2">
              <X className="w-4 h-4 mr-2" />
              Continuar com plano atual
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default UpgradeModal;