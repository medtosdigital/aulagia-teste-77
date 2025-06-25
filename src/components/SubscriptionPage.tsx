
import React, { useState } from 'react';
import { Crown, Check, Users, Download, FileText, Calendar, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limitations: string[];
  color: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
}

const SubscriptionPage = () => {
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan] = useState('gratuito'); // Simulando plano atual do usuário

  const plans: Plan[] = [
    {
      id: 'gratuito',
      name: 'Gratuito',
      price: { monthly: 0, yearly: 0 },
      features: [
        '5 materiais por mês',
        'Download em PDF',
        'Suporte básico',
        'Acesso aos templates básicos'
      ],
      limitations: [
        'Sem download em Word/PPT',
        'Limitado a 3 criações de material',
        'Sem edição avançada'
      ],
      color: 'from-gray-400 to-gray-600',
      icon: FileText
    },
    {
      id: 'professor',
      name: 'Professor',
      price: { monthly: 29.90, yearly: 299 },
      features: [
        '60 materiais por mês',
        'Download em PDF, Word e PPT',
        'Edição completa de materiais',
        'Todos os templates disponíveis',
        'Suporte prioritário',
        'Calendário de aulas',
        'Histórico completo'
      ],
      limitations: [],
      color: 'from-blue-500 to-purple-600',
      icon: Crown,
      popular: true
    },
    {
      id: 'escola',
      name: 'Escola',
      price: { monthly: 89.90, yearly: 849 },
      features: [
        'Até 5 professores',
        'Todos os recursos do plano Professor',
        'Dashboard de gestão escolar',
        'Relatórios detalhados',
        'Suporte premium',
        'Gestão centralizada',
        'Controle de permissões'
      ],
      limitations: [],
      color: 'from-green-500 to-emerald-600',
      icon: Users
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Escolha seu Plano
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Potencialize suas aulas com a inteligência artificial. Escolha o plano ideal para suas necessidades.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-sm border">
            <button
              onClick={() => setBillingType('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingType === 'monthly'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingType('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingType === 'yearly'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
            </button>
          </div>
          {billingType === 'yearly' && (
            <Badge className="ml-3 bg-green-100 text-green-800">
              <Star className="w-3 h-3 mr-1" />
              Economize até 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const price = billingType === 'monthly' ? plan.price.monthly : plan.price.yearly;
          const yearlyDiscount = getYearlyDiscount(plan);

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    Plano Atual
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900">
                    {price === 0 ? 'Grátis' : formatPrice(price)}
                  </div>
                  {price > 0 && (
                    <div className="text-sm text-gray-600">
                      {billingType === 'monthly' ? 'por mês' : 'por ano'}
                      {billingType === 'yearly' && yearlyDiscount > 0 && (
                        <span className="block text-green-600 font-medium">
                          Economize {yearlyDiscount}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recursos inclusos:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-600 mb-3">Limitações:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0">×</span>
                          <span className="text-gray-600 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  className={`w-full py-3 ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Plano Atual' : `Escolher ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Plan Info */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Informações da Sua Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Plano Atual</div>
                <div className="text-lg font-bold text-blue-900">Gratuito</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Materiais Restantes</div>
                <div className="text-lg font-bold text-green-900">3 de 5</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Próxima Renovação</div>
                <div className="text-lg font-bold text-purple-900">01/01/2024</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Precisa de mais recursos?</h3>
                  <p className="text-gray-600 text-sm">Faça upgrade para desbloquear funcionalidades premium</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-gray-600">Sim, você pode cancelar sua assinatura a qualquer momento. Seu acesso continuará até o final do período pago.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">O que acontece se eu exceder o limite de materiais?</h3>
                <p className="text-gray-600">Você será notificado quando atingir o limite e poderá fazer upgrade do seu plano para continuar criando materiais.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">O plano Escola inclui suporte técnico?</h3>
                <p className="text-gray-600">Sim, o plano Escola inclui suporte premium com atendimento prioritário para gestores e professores.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPage;
