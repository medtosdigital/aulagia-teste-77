
import React, { useState } from 'react';
import { Crown, Check, Users, ArrowUpDown, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
}

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: any;
  onPlanChange: (planId: string) => void;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({ 
  isOpen, 
  onClose, 
  currentPlan, 
  onPlanChange 
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const plans: Plan[] = [
    {
      id: 'gratuito',
      name: 'Gratuito',
      price: { monthly: 0, yearly: 0 },
      features: [
        '5 materiais por mês',
        'Download em PDF',
        'Suporte básico'
      ]
    },
    {
      id: 'professor',
      name: 'Professor',
      price: { monthly: 29.90, yearly: 299 },
      features: [
        '60 materiais por mês',
        'Download em PDF, Word e PPT',
        'Edição completa de materiais',
        'Suporte por e-mail'
      ],
      popular: true
    },
    {
      id: 'grupo-escolar',
      name: 'Grupo Escolar',
      price: { monthly: 89.90, yearly: 849 },
      features: [
        'Até 5 professores',
        '60 materiais por professor/mês',
        'Dashboard colaborativo',
        'Suporte prioritário'
      ]
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getYearlyDiscount = (plan: Plan) => {
    const monthlyTotal = plan.price.monthly * 12;
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - plan.price.yearly) / monthlyTotal) * 100);
  };

  const handlePlanChange = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      onPlanChange(selectedPlan);
      setIsLoading(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto rounded-xl border-0 p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <ArrowUpDown className="w-5 h-5 text-blue-600" />
            Alterar Plano
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Escolha o plano que melhor atende às suas necessidades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Billing Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <span className="text-sm font-medium text-gray-500">Faturamento:</span>
            <div className="bg-white rounded-full p-1 shadow-sm border-2 w-fit">
              <button
                onClick={() => setBillingType('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  billingType === 'monthly'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingType('yearly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  billingType === 'yearly'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual
              </button>
            </div>
            {billingType === 'yearly' && (
              <Badge className="bg-green-100 text-green-800 text-xs rounded-full">
                <Star className="w-3 h-3 mr-1" />
                20% off
              </Badge>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan.id === plan.id;
              const price = billingType === 'monthly' ? plan.price.monthly : plan.price.yearly;
              const yearlyDiscount = getYearlyDiscount(plan);
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-300 border-2 rounded-xl p-4 sm:p-6 ${
                    plan.popular ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200'
                  } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''} ${
                    isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
                        POPULAR
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500 text-white px-2 py-1 text-xs rounded-full">
                        Atual
                      </Badge>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-800">
                      {price === 0 ? 'R$ 0' : formatPrice(price)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {billingType === 'monthly' ? '/mês' : '/ano'}
                    </span>
                    {price > 0 && billingType === 'yearly' && yearlyDiscount > 0 && (
                      <span className="block text-sm text-gray-500">
                        ou {formatPrice(plan.price.monthly)}/mês ({yearlyDiscount}% off)
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none">
                      <div className="absolute top-2 right-2">
                        <div className="bg-purple-500 text-white rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Plan Info */}
          {selectedPlan && selectedPlan !== currentPlan.id && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2">Mudança de Plano</h4>
              <p className="text-blue-700 text-sm">
                Você está alterando do plano <strong>{currentPlan.name}</strong> para o plano{' '}
                <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong>.
                A diferença de valor será ajustada na próxima fatura.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto h-12 rounded-xl border-2 text-base"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePlanChange} 
              disabled={!selectedPlan || selectedPlan === currentPlan.id || isLoading}
              className="w-full sm:w-auto h-12 rounded-xl text-base"
            >
              {isLoading ? 'Alterando...' : 'Confirmar Alteração'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
