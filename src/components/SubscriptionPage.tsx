
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users, Star, Zap, Shield } from 'lucide-react';
import { ChangePlanModal } from '@/components/ChangePlanModal';
import { useUnifiedPlanPermissions } from '@/hooks/useUnifiedPlanPermissions';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

export default function SubscriptionPage() {
  const {
    currentProfile,
    loading,
    changePlan,
    getPlanDisplayName,
    refreshData
  } = useUnifiedPlanPermissions();

  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);

  const plans: Plan[] = [
    {
      id: 'gratuito',
      name: 'Gratuito',
      price: { monthly: 0, yearly: 0 },
      features: [
        '5 materiais por mês',
        'Download em PDF',
        'Suporte básico por email'
      ],
      icon: Star,
      color: 'text-gray-500',
      description: 'Perfeito para começar'
    },
    {
      id: 'professor',
      name: 'Professor',
      price: { monthly: 29.90, yearly: 299 },
      features: [
        '50 materiais por mês',
        'Download em PDF, Word e PPT',
        'Edição completa de materiais',
        'Geração de slides automática',
        'Suporte prioritário por email'
      ],
      popular: true,
      icon: Crown,
      color: 'text-yellow-500',
      description: 'Ideal para professores individuais'
    },
    {
      id: 'grupo_escolar',
      name: 'Grupo Escolar',
      price: { monthly: 89.90, yearly: 849 },
      features: [
        'Até 5 professores',
        '300 materiais por mês (total)',
        'Dashboard colaborativo',
        'Gestão centralizada de usuários',
        'Suporte premium via WhatsApp',
        'Relatórios de uso detalhados'
      ],
      icon: Users,
      color: 'text-purple-500',
      description: 'Para escolas e grupos de professores'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCurrentPlan = () => {
    const planId = currentProfile?.plano_ativo || 'gratuito';
    return plans.find(plan => plan.id === planId) || plans[0];
  };

  const handlePlanChange = async (newPlanId: string) => {
    const success = await changePlan(newPlanId as any);
    if (success) {
      setIsChangePlanModalOpen(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const currentPlan = getCurrentPlan();
  const isCurrentPlan = (planId: string) => currentPlan.id === planId;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Escolha seu Plano
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Potencialize sua prática educativa com nossas ferramentas de IA. 
          Plano atual: <strong>{getPlanDisplayName()}</strong>
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className={`border-2 ${currentPlan.color.replace('text-', 'border-').replace('-500', '-200')} bg-gradient-to-r from-blue-50 to-purple-50`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <currentPlan.icon className={`w-8 h-8 ${currentPlan.color}`} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Plano {currentPlan.name}
                  </h3>
                  <p className="text-gray-600">{currentPlan.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {currentPlan.price.monthly === 0 ? 'Gratuito' : formatPrice(currentPlan.price.monthly)}
                </div>
                {currentPlan.price.monthly > 0 && (
                  <div className="text-sm text-gray-500">/mês</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          
          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-2 border-blue-500 ring-2 ring-blue-100' 
                  : isCurrent
                  ? 'border-2 border-green-500 ring-2 ring-green-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    MAIS POPULAR
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    PLANO ATUAL
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <PlanIcon className={`w-12 h-12 ${plan.color}`} />
                </div>
                <CardTitle className="text-xl text-gray-900">{plan.name}</CardTitle>
                <p className="text-gray-500 text-sm">{plan.description}</p>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price.monthly === 0 ? 'Gratuito' : formatPrice(plan.price.monthly)}
                  </div>
                  {plan.price.monthly > 0 && (
                    <>
                      <div className="text-sm text-gray-500">/mês</div>
                      <div className="text-xs text-gray-400 mt-1">
                        ou {formatPrice(plan.price.yearly)}/ano (economize 17%)
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => setIsChangePlanModalOpen(true)}
                  disabled={isCurrent}
                  className={`w-full transition-all ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Plano Atual' : `Escolher ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="max-w-4xl mx-auto mt-12">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Seguro & Confiável</h3>
                <p className="text-sm text-gray-600">Seus dados estão seguros conosco</p>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Rápido & Eficiente</h3>
                <p className="text-sm text-gray-600">Gere materiais em segundos</p>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Suporte Dedicado</h3>
                <p className="text-sm text-gray-600">Estamos aqui para ajudar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Plan Modal */}
      <ChangePlanModal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        currentPlan={currentPlan}
        onPlanChange={handlePlanChange}
      />
    </div>
  );
}
