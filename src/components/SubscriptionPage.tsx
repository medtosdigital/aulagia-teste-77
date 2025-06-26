import React, { useState, useEffect } from 'react';
import { Crown, Check, Users, Download, FileText, Calendar, Zap, Star, CreditCard, Ban, ArrowUpDown, ChevronDown, Brain, Presentation, ClipboardList, GraduationCap, MoreHorizontal, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { ChangeCardModal } from '@/components/ChangeCardModal';
import { ChangePlanModal } from '@/components/ChangePlanModal';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  materialTypes: string[];
  limitations: string[];
  color: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
}

const SubscriptionPage = () => {
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const [isChangeCardModalOpen, setIsChangeCardModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  const { 
    currentPlan, 
    usage, 
    getRemainingMaterials, 
    getNextResetDate,
    changePlan,
    refreshData
  } = usePlanPermissions();

  // Refresh data when component mounts and at intervals to ensure real-time updates
  useEffect(() => {
    refreshData();
    
    // Set up interval to refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

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
      materialTypes: [
        'Planos de Aula básicos',
        'Atividades simples'
      ],
      limitations: [
        'Sem download em Word/PPT',
        '5 materiais por mês',
        'Sem edição avançada',
        'Sem Slides Interativos',
        'Sem Avaliações Personalizadas'
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
        'Suporte por e-mail',
        'Calendário de aulas',
        'Histórico completo'
      ],
      materialTypes: [
        'Planos de Aula completos',
        'Slides interativos',
        'Atividades diversificadas',
        'Avaliações personalizadas'
      ],
      limitations: [],
      color: 'from-blue-500 to-purple-600',
      icon: Crown,
      popular: true
    },
    {
      id: 'grupo-escolar',
      name: 'Grupo Escolar',
      price: { monthly: 89.90, yearly: 849 },
      features: [
        'Até 5 professores',
        '60 materiais por professor/mês',
        'Todos os recursos do plano Professor',
        'Dashboard de gestão colaborativa',
        'Compartilhamento de materiais entre professores',
        'Relatórios detalhados de uso',
        'Suporte prioritário',
        'Gestão centralizada de usuários',
        'Controle de permissões',
        'Ideal para grupos de professores ou instituições'
      ],
      materialTypes: [],
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

  const getMaterialTypeIcon = (materialType: string) => {
    if (materialType.includes('Planos de Aula')) return GraduationCap;
    if (materialType.includes('Slides')) return Presentation;
    if (materialType.includes('Atividades')) return ClipboardList;
    if (materialType.includes('Avaliações')) return FileText;
    return Brain;
  };

  const handlePlanChange = (planId: string) => {
    changePlan(planId);
  };

  const handleCancelSubscription = () => {
    // Logic to cancel subscription
    console.log('Cancelar assinatura');
    setIsCancelModalOpen(false);
    // Add actual cancellation logic here
  };

  // Calculate usage percentage with real-time data from the hook
  const usagePercentage = currentPlan.limits.materialsPerMonth > 0 
    ? Math.min((usage.materialsThisMonth / currentPlan.limits.materialsPerMonth) * 100, 100)
    : 0;

  // Format next reset date using real data
  const nextResetDate = getNextResetDate();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Get remaining materials using real data
  const remainingMaterials = getRemainingMaterials();

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      {/* Current Plan Section */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <Card className="overflow-hidden">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1">Seu Plano Atual</h1>
                <p className="opacity-90 text-sm sm:text-base">Plano {currentPlan.name} - Mensal</p>
              </div>
              <div className="bg-white/20 rounded-full px-3 sm:px-4 py-1 flex items-center self-start">
                <Crown className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">Ativo</span>
              </div>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Usage Card - Updated with real-time data using Progress component */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
                    <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mr-2" />
                    Materiais gerados
                  </h3>
                  <span className="text-blue-600 font-bold text-sm sm:text-base">
                    {usage.materialsThisMonth}/{currentPlan.limits.materialsPerMonth}
                  </span>
                </div>
                
                {/* Progress Bar using shadcn/ui Progress component */}
                <Progress 
                  value={usagePercentage} 
                  className="w-full h-2.5 mb-2" 
                />
                
                <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-500">
                  <span>0</span>
                  <span>{currentPlan.limits.materialsPerMonth}</span>
                </div>
                
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Renova em {formatDate(nextResetDate)}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {remainingMaterials} restantes
                  </p>
                </div>
                
                {/* Warning messages based on real usage */}
                {usagePercentage >= 80 && remainingMaterials > 0 && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                    <span className="font-medium">Atenção:</span> Você já usou {Math.round(usagePercentage)}% dos seus materiais este mês
                  </div>
                )}
                {remainingMaterials === 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <span className="font-medium">Limite atingido:</span> Faça upgrade para continuar gerando materiais
                  </div>
                )}
              </div>

              {/* Payment Card - keep existing code */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
                    <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mr-2" />
                    Próximo pagamento
                  </h3>
                  <span className="text-blue-600 font-bold text-sm sm:text-base">
                    {formatPrice(currentPlan.price.monthly)}
                  </span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>15 de cada mês</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>Cartão finalizado em 1234</span>
                </div>
              </div>
            </div>

            {/* Features - keep existing code */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Recursos incluídos:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center">
                  <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{currentPlan.limits.materialsPerMonth} materiais/mês</span>
                </div>
                {currentPlan.limits.canDownloadWord && (
                  <div className="flex items-center">
                    <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Downloads ilimitados</span>
                  </div>
                )}
                {currentPlan.limits.canDownloadPPT && (
                  <div className="flex items-center">
                    <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Word, PPT e PDF</span>
                  </div>
                )}
                {currentPlan.limits.canEditMaterials && (
                  <div className="flex items-center">
                    <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Edição completa</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions - keep existing code */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">Gerenciar assinatura</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Altere ou cancele quando quiser</p>
                </div>
                
                {/* Desktop Actions - 3 columns */}
                <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center text-sm"
                    onClick={() => setIsChangeCardModalOpen(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Alterar cartão
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center text-sm"
                    onClick={() => setIsChangePlanModalOpen(true)}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Alterar plano
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center justify-center text-sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setIsCancelModalOpen(true)}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Cancelar assinatura
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Actions - keep existing vertical layout */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center w-full text-sm"
                    onClick={() => setIsChangeCardModalOpen(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Alterar cartão
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center w-full text-sm"
                    onClick={() => setIsChangePlanModalOpen(true)}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Alterar plano
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center w-full text-sm text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setIsCancelModalOpen(true)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Section - keep existing code */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Atualize seu Plano</h1>
              <p className="text-gray-600 text-sm sm:text-base">Escolha o plano que melhor atende às suas necessidades</p>
            </div>
            
            {/* Billing Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm font-medium text-gray-500">Faturamento:</span>
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-full p-1 shadow-sm border">
                  <button
                    onClick={() => setBillingType('monthly')}
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      billingType === 'monthly'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setBillingType('yearly')}
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      billingType === 'yearly'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Anual
                  </button>
                </div>
                {billingType === 'yearly' && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    20% off
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Plans Grid - keep existing code */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan.id === plan.id;
              const price = billingType === 'monthly' ? plan.price.monthly : plan.price.yearly;
              const yearlyDiscount = getYearlyDiscount(plan);

              return (
                <div
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-xl border rounded-xl p-4 sm:p-6 flex flex-col ${
                    plan.popular ? 'ring-2 ring-blue-500 lg:scale-105 border-blue-200' : 'border-gray-200'
                  } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-3 sm:px-4 py-1 text-xs">
                        POPULAR
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500 text-white px-2 sm:px-3 py-1 text-xs">
                        Plano Atual
                      </Badge>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {plan.id === 'gratuito' && 'Ideal para quem quer testar a plataforma'}
                      {plan.id === 'professor' && 'Para professores que querem mais recursos'}
                      {plan.id === 'grupo-escolar' && 'Para grupos de professores e instituições de ensino'}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {price === 0 ? 'R$ 0' : formatPrice(price)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {billingType === 'monthly' ? '/mês' : '/ano'}
                    </span>
                    {price > 0 && billingType === 'yearly' && yearlyDiscount > 0 && (
                      <span className="block text-xs sm:text-sm text-gray-500">
                        ou {formatPrice(plan.price.monthly)}/mês ({yearlyDiscount}% off)
                      </span>
                    )}
                  </div>

                  {/* Material Types - only show if plan has materialTypes */}
                  {plan.materialTypes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                        <Brain className="w-4 h-4 text-blue-600 mr-2" />
                        Tipos de Materiais
                      </h4>
                      <div className="space-y-2">
                        {plan.materialTypes.map((materialType, index) => {
                          const MaterialIcon = getMaterialTypeIcon(materialType);
                          return (
                            <div key={index} className="flex items-start">
                              <MaterialIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-xs sm:text-sm">{materialType}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Special highlight for Grupo Escolar plan */}
                  {plan.id === 'grupo-escolar' && (
                    <div className="mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center text-sm">
                          <Crown className="w-4 h-4 text-blue-600 mr-2" />
                          Todos os recursos do plano Professor
                        </h4>
                        <p className="text-blue-700 text-xs">
                          Inclui todos os tipos de materiais e funcionalidades do plano Professor, 
                          além dos recursos colaborativos exclusivos para grupos.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 sm:space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0">×</span>
                        <span className="text-gray-400 text-xs sm:text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanChange(plan.id)}
                    className={`w-full py-2 sm:py-3 text-sm ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : plan.id === 'grupo-escolar'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plano Atual' : 'Assinar Agora'}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* FAQ Section - keep existing code */}
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  Posso mudar de plano a qualquer momento?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-xs sm:text-sm">
                  Sim, você pode atualizar ou downgradear seu plano a qualquer momento. Qualquer diferença de valor será prorrateada e ajustada na próxima fatura.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  Como funciona o plano Grupo Escolar?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-xs sm:text-sm">
                  O plano Grupo Escolar é ideal tanto para grupos independentes de professores quanto para instituições de ensino. Permite adicionar até 5 professores, cada um com acesso individual à plataforma com todos os benefícios do plano Professor, além de recursos colaborativos como compartilhamento de materiais e dashboard de gestão centralizada.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  Posso cancelar minha assinatura a qualquer momento?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-xs sm:text-sm">
                  Sim, você pode cancelar sua assinatura a qualquer momento. Seu acesso aos recursos premium permanecerá ativo até o final do período de faturamento atual.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  Quais métodos de pagamento são aceitos?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-xs sm:text-sm">
                  Aceitamos todos os principais cartões de crédito (Visa, Mastercard, American Express, Elo) e também pagamentos via PIX. Para planos anuais, oferecemos a opção de boleto bancário.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  Como funciona o período de teste?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-xs sm:text-sm">
                  Todos os novos usuários têm direito ao plano Gratuito que permite gerar até 5 materiais por mês. Não oferecemos um período de teste adicional para os planos pagos, mas você pode cancelar a qualquer momento sem custos adicionais.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Modals - keep existing code */}
      <ChangeCardModal 
        isOpen={isChangeCardModalOpen} 
        onClose={() => setIsChangeCardModalOpen(false)} 
      />
      
      <ChangePlanModal 
        isOpen={isChangePlanModalOpen} 
        onClose={() => setIsChangePlanModalOpen(false)}
        currentPlan={currentPlan}
        onPlanChange={handlePlanChange}
      />

      {/* Cancel Subscription Modal */}
      <AlertDialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Cancelar Assinatura
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Tem certeza de que deseja cancelar sua assinatura?
              <br /><br />
              <strong>O que acontecerá:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Você manterá acesso aos recursos premium até o final do período atual</li>
                <li>Não será cobrado novamente</li>
                <li>Após o vencimento, sua conta será alterada para o plano Gratuito</li>
                <li>Você poderá reativar sua assinatura a qualquer momento</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionPage;
