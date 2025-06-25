
import React, { useState } from 'react';
import { Crown, Check, Users, Download, FileText, Calendar, Zap, Star, CreditCard, ArrowRight, Sparkles, TrendingUp, Shield, Clock, BarChart3, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limitations: string[];
  gradient: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
  buttonText: string;
  savings?: number;
}

const SubscriptionPage = () => {
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan] = useState('gratuito');

  const plans: Plan[] = [
    {
      id: 'gratuito',
      name: 'Gratuito',
      description: 'Ideal para quem quer testar a plataforma',
      price: { monthly: 0, yearly: 0 },
      features: [
        '5 materiais mensais',
        'Download em PDF básico',
        'Templates essenciais',
        'Suporte via comunidade'
      ],
      limitations: [
        'Sem downloads Word/PPT',
        'Limitação de 3 criações',
        'Sem recursos avançados'
      ],
      gradient: 'from-slate-400 via-slate-500 to-slate-600',
      icon: FileText,
      buttonText: 'Começar Grátis'
    },
    {
      id: 'professor',
      name: 'Professor',
      description: 'Perfeito para educadores dedicados',
      price: { monthly: 29.90, yearly: 299 },
      features: [
        '60 materiais mensais',
        'Todos os formatos (PDF, Word, PPT)',
        'Editor avançado com IA',
        'Biblioteca completa de templates',
        'Calendário inteligente',
        'Suporte prioritário',
        'Histórico completo',
        'Exportação em lote'
      ],
      limitations: [],
      gradient: 'from-blue-500 via-purple-500 to-indigo-600',
      icon: Crown,
      popular: true,
      buttonText: 'Começar Agora',
      savings: 16
    },
    {
      id: 'escola',
      name: 'Escola',
      description: 'Solução completa para instituições',
      price: { monthly: 89.90, yearly: 849 },
      features: [
        'Até 5 professores inclusos',
        'Dashboard de gestão avançado',
        'Relatórios e analytics',
        'Controle de permissões',
        'API para integração',
        'Suporte dedicado',
        'Treinamento incluído',
        'Backup automático'
      ],
      limitations: [],
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      icon: Users,
      buttonText: 'Falar com Vendas',
      savings: 21
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const features = [
    {
      icon: Sparkles,
      title: 'IA Avançada',
      description: 'Criação automática com tecnologia de ponta'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Acompanhe o desempenho dos seus materiais'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Seus dados protegidos com criptografia'
    },
    {
      icon: Clock,
      title: 'Economia de Tempo',
      description: 'Reduza em 80% o tempo de criação'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-3xl"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-floating"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-floating" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
              <Crown className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Potencialize suas
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Aulas com IA
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Escolha o plano ideal e transforme sua forma de ensinar com a mais avançada 
              inteligência artificial educacional do Brasil
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1.5 mb-12">
              <button
                onClick={() => setBillingType('monthly')}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingType === 'monthly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingType('yearly')}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingType === 'yearly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Anual
              </button>
              {billingType === 'yearly' && (
                <Badge className="ml-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 animate-pulse">
                  <Gift className="w-3 h-3 mr-1" />
                  Economize até 21%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 mb-12">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">Seu Plano Atual</h3>
                <p className="text-blue-100">Plano Gratuito • 3 de 5 materiais usados</p>
              </div>
              <Badge className="bg-white/20 text-white border-0 mt-3 md:mt-0 w-fit">
                <Clock className="w-4 h-4 mr-1" />
                Renova em 12 dias
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">3/5</div>
                <div className="text-sm text-gray-600">Materiais Usados</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">PDF</div>
                <div className="text-sm text-gray-600">Formato Disponível</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">Upgrade</div>
                <div className="text-sm text-gray-600">Recomendado</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Pronto para mais?</h4>
                  <p className="text-gray-600 text-sm">Desbloqueie recursos premium</p>
                </div>
                <Button className="mt-3 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Fazer Upgrade
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            const price = billingType === 'monthly' ? plan.price.monthly : plan.price.yearly;
            
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl group ${
                  plan.popular 
                    ? 'ring-2 ring-purple-500 shadow-2xl scale-105' 
                    : isCurrentPlan 
                    ? 'ring-2 ring-green-500' 
                    : 'hover:ring-2 hover:ring-blue-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-bold">
                    <Star className="w-4 h-4 inline mr-1" />
                    MAIS POPULAR
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-green-500 text-white">
                      Atual
                    </Badge>
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${plan.gradient}`}></div>
                
                <CardHeader className="text-center pb-4 pt-6">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {price === 0 ? 'Grátis' : formatPrice(price)}
                    </div>
                    {price > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {billingType === 'monthly' ? 'por mês' : 'por ano'}
                        {billingType === 'yearly' && plan.savings && (
                          <div className="text-green-600 font-medium mt-1">
                            💰 Economize {plan.savings}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500 mb-2">Limitações:</p>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0">×</span>
                            <span className="text-gray-500 text-xs">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    className={`w-full py-3 font-semibold transition-all duration-300 ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                        : plan.popular
                        ? `bg-gradient-to-r ${plan.gradient} hover:shadow-lg hover:scale-105 text-white`
                        : `bg-gradient-to-r ${plan.gradient} hover:shadow-lg hover:scale-105 text-white`
                    }`}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plano Atual' : plan.buttonText}
                    {!isCurrentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que escolher a AulagIA?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra os recursos que fazem da nossa plataforma a escolha número 1 
            dos educadores brasileiros
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 text-center">
            <CardTitle className="text-2xl">Perguntas Frequentes</CardTitle>
            <p className="text-gray-600">Tire suas dúvidas sobre nossos planos</p>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Posso cancelar a qualquer momento?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Sim, você pode cancelar sua assinatura a qualquer momento. Seu acesso continuará 
                  até o final do período pago, sem taxas de cancelamento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  O que acontece se eu exceder o limite de materiais?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Você será notificado quando atingir 80% do limite. Caso exceda, poderá fazer 
                  upgrade imediato ou aguardar a renovação mensal do seu plano.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Como funciona o plano Escola?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  O plano Escola inclui licenças para até 5 professores, dashboard de gestão 
                  centralizado, relatórios detalhados e suporte dedicado para administradores.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Quais formas de pagamento são aceitas?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Aceitamos cartões de crédito (Visa, Mastercard, Elo), PIX e boleto bancário. 
                  Para planos anuais, oferecemos condições especiais de pagamento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar suas aulas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 10.000 educadores que já descobriram 
            o poder da IA na educação
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Agendar Demonstração
              <Calendar className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
