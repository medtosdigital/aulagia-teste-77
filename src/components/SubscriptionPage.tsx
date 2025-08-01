import React, { useState, useEffect, useCallback } from 'react';
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
import { activityService } from '@/services/activityService';

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
  const [billingType, setBillingType] = useState<'mensal' | 'anual'>('mensal');
  const [isChangeCardModalOpen, setIsChangeCardModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  const { 
    currentPlan, 
    usage, 
    getRemainingMaterials, 
    getNextResetDate,
    changePlan,
    refreshData,
    loading,
    currentProfile // <-- ADICIONADO
  } = usePlanPermissions();

  // Mapear o ID do plano atual para comparação
  const getCurrentPlanId = () => {
    if (!currentPlan || loading) return 'gratuito';
    if (currentPlan.id === 'admin') return 'admin';
    // Mapear os IDs do sistema para os IDs da interface
    switch (currentPlan.id) {
      case 'gratuito':
        return 'gratuito';
      case 'professor':
        return 'professor';
      case 'grupo_escolar':
      case 'grupo-escolar':
        return 'grupo-escolar';
      default:
        return 'gratuito';
    }
  };

  const currentPlanId = getCurrentPlanId();

  // Determine subscription status based on real plan data
  const isSubscriptionActive = currentPlanId !== 'gratuito';
  const subscriptionStatus = isSubscriptionActive ? 'Ativo' : 'Inativo';

  // Corrigir detecção do tipo de faturamento
  let realBillingType: 'mensal' | 'anual' = 'mensal';
  if (currentProfile?.billing_type) {
    realBillingType = normalizeBillingType(currentProfile.billing_type);
  } else if (currentProfile?.data_inicio_plano && currentProfile?.data_expiracao_plano) {
    const start = new Date(currentProfile.data_inicio_plano);
    const end = new Date(currentProfile.data_expiracao_plano);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (diffMonths >= 11) {
      realBillingType = 'anual';
    }
  }

  // Atualizar billingType para refletir o real do usuário ao montar
  React.useEffect(() => {
    setBillingType(realBillingType);
  }, [realBillingType]);

  // Remover qualquer chamada a stableRefreshData
  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Só roda uma vez ao montar

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
        '50 materiais por mês',
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
        '300 materiais por mês (total)',
        'Todos os recursos do plano Professor',
        'Dashboard de gestão colaborativa',
        'Compartilhamento de materiais entre professores',
        'Relatórios detalhados de uso',
        'Suporte prioritário',
        'Gestão centralizada de usuários',
        'Controle de permissões',
        'Distribuição flexível de materiais entre professores'
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

  const handlePlanChange = async (planId: string) => {
    await changePlan(planId, billingType);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      activityService.addActivity({
        type: 'updated',
        title: 'Assinatura alterada',
        description: `Plano alterado para: ${plan.name} (${billingType === 'anual' ? 'Anual' : 'Mensal'})`
      });
    }
  };

  const handleCancelSubscription = () => {
    // Logic to cancel subscription
    console.log('Cancelar assinatura');
    setIsCancelModalOpen(false);
    // Add actual cancellation logic here
  };

  // Calculate usage percentage with real-time data from the hook
  const usagePercentage = currentPlan.id === 'admin'
    ? 0
    : currentPlan.limits.materialsPerMonth > 0 
      ? Math.min((usage.materialsThisMonth / currentPlan.limits.materialsPerMonth) * 100, 100)
      : 0;

  // Format next reset date using real data
  const nextResetDate = getNextResetDate();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Get remaining materials using real data
  const remainingMaterials = currentPlan.id === 'admin' ? 'Ilimitado' : getRemainingMaterials();

  // Função para calcular próxima renovação dos materiais
  const getNextMaterialsResetDate = () => {
    if (!currentProfile?.ultimo_reset_materiais) return null;
    const lastReset = new Date(currentProfile.ultimo_reset_materiais);
    // Próximo reset: mesmo dia do mês seguinte
    const nextReset = new Date(lastReset);
    nextReset.setMonth(lastReset.getMonth() + 1);
    return nextReset;
  };

  // Função para próxima renovação/pagamento
  const getNextPaymentDate = () => {
    if (currentProfile?.data_expiracao_plano) {
      return new Date(currentProfile.data_expiracao_plano);
    }
    return null;
  };

  // Function to get all resources for current plan
  const getAllResourcesForCurrentPlan = () => {
    const resources = [];
    
    // Basic resources
    if (currentPlan.id === 'admin') {
      resources.push({
        name: `Materiais ilimitados`,
        icon: FileText,
        available: true
      });
      resources.push(
        { name: 'Planos de Aula (ilimitado)', icon: GraduationCap, available: true },
        { name: 'Slides (ilimitado)', icon: Presentation, available: true },
        { name: 'Atividades (ilimitado)', icon: ClipboardList, available: true },
        { name: 'Avaliações (ilimitado)', icon: FileText, available: true },
        { name: 'Download em PDF', icon: Download, available: true },
        { name: 'Download em Word', icon: Download, available: true },
        { name: 'Download em PowerPoint', icon: Download, available: true },
        { name: 'Edição completa de materiais', icon: Brain, available: true },
        { name: 'Calendário de aulas', icon: Calendar, available: true },
        { name: 'Histórico completo', icon: FileText, available: true },
        // Recursos do grupo escolar:
        { name: 'Dashboard colaborativo', icon: Users, available: true },
        { name: 'Compartilhamento entre professores', icon: Users, available: true },
        { name: 'Gestão de usuários', icon: Users, available: true },
        { name: 'Distribuição de materiais entre professores', icon: Users, available: true },
        // Recursos administrativos:
        { name: 'Acesso total a todos os recursos', icon: Crown, available: true },
        { name: 'Controle de usuários, planos e histórico', icon: Crown, available: true },
        { name: 'Permissão exclusiva para administração', icon: Crown, available: true },
        { name: 'Visualização e gestão de todos os usuários e materiais', icon: Crown, available: true }
      );
      return resources;
    }

    // Material types based on plan
    if (currentPlan.id === 'gratuito') {
      resources.push(
        { name: 'Planos de Aula básicos', icon: GraduationCap, available: true },
        { name: 'Atividades simples', icon: ClipboardList, available: true }
      );
    } else if (currentPlan.id === 'professor' || currentPlan.id === 'grupo_escolar' || currentPlan.id === 'grupo-escolar') {
      resources.push(
        { name: 'Planos de Aula completos', icon: GraduationCap, available: true },
        { name: 'Slides interativos', icon: Presentation, available: true },
        { name: 'Atividades diversificadas', icon: ClipboardList, available: true },
        { name: 'Avaliações personalizadas', icon: FileText, available: true }
      );
    }
    if (currentPlan.id === 'admin') {
      resources.push(
        { name: 'Planos de Aula (ilimitado)', icon: GraduationCap, available: true },
        { name: 'Slides (ilimitado)', icon: Presentation, available: true },
        { name: 'Atividades (ilimitado)', icon: ClipboardList, available: true },
        { name: 'Avaliações (ilimitado)', icon: FileText, available: true }
      );
    }

    // Download capabilities
    resources.push({ name: 'Download em PDF', icon: Download, available: true });
    
    if (currentPlan.limits.canDownloadWord) {
      resources.push({ name: 'Download em Word', icon: Download, available: true });
    } else {
      resources.push({ name: 'Download em Word', icon: Download, available: false });
    }

    if (currentPlan.limits.canDownloadPPT) {
      resources.push({ name: 'Download em PowerPoint', icon: Download, available: true });
    } else {
      resources.push({ name: 'Download em PowerPoint', icon: Download, available: false });
    }

    // Editing capabilities
    if (currentPlan.limits.canEditMaterials) {
      resources.push({ name: 'Edição completa de materiais', icon: Brain, available: true });
    } else {
      resources.push({ name: 'Edição completa de materiais', icon: Brain, available: false });
    }

    // Calendar
    if (currentPlan.limits.hasCalendar) {
      resources.push({ name: 'Calendário de aulas', icon: Calendar, available: true });
    } else {
      resources.push({ name: 'Calendário de aulas', icon: Calendar, available: false });
    }

    // History
    if (currentPlan.limits.hasHistory) {
      resources.push({ name: 'Histórico completo', icon: FileText, available: true });
    } else {
      resources.push({ name: 'Histórico limitado', icon: FileText, available: false });
    }

    // Collaboration (only for school plan)
    if (currentPlan.id === 'grupo_escolar' || currentPlan.id === 'grupo-escolar') {
      resources.push(
        { name: 'Dashboard colaborativo', icon: Users, available: true },
        { name: 'Compartilhamento entre professores', icon: Users, available: true },
        { name: 'Gestão de usuários', icon: Users, available: true },
        { name: 'Distribuição de materiais entre professores', icon: Users, available: true }
      );
    } else {
      resources.push(
        { name: 'Dashboard colaborativo', icon: Users, available: false },
        { name: 'Compartilhamento entre professores', icon: Users, available: false }
      );
    }
    if (currentPlan.id === 'admin') {
      resources.push({ name: 'Acesso total a todos os recursos', icon: Crown, available: true });
      resources.push({ name: 'Controle de usuários, planos e histórico', icon: Crown, available: true });
      resources.push({ name: 'Permissão exclusiva para administração', icon: Crown, available: true });
      resources.push({ name: 'Visualização e gestão de todos os usuários e materiais', icon: Crown, available: true });
    }

    return resources;
  };

  // Formatador de datas do perfil
  const formatDateString = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading || currentPlan.id === 'carregando') {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando informações do plano...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      {/* Current Plan Section */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <Card className="overflow-hidden">
          {/* Plan Header - Updated with real subscription status */}
          <div className={`p-4 sm:p-6 text-white ${
            isSubscriptionActive 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1">Seu Plano Atual</h1>
                <p className="opacity-90 text-sm sm:text-base">
                  {(() => {
                    if (currentPlan.id === 'admin') {
                      return 'Plano Administrador - Administrador';
                    } else if (currentPlan.id === 'grupo_escolar' || currentPlan.id === 'grupo-escolar') {
                      return `Plano Grupo Escolar - ${isSubscriptionActive ? (billingType === 'anual' ? 'Anual' : 'Mensal') : 'Gratuito'}`;
                    } else if (currentPlan.id === 'professor') {
                      return `Plano Professor - ${isSubscriptionActive ? (billingType === 'anual' ? 'Anual' : 'Mensal') : 'Gratuito'}`;
                    } else {
                      return 'Plano Gratuito';
                    }
                  })()}
                </p>
                {/* Removido bloco de datas de início e expiração do plano */}
              </div>
              <div className={`rounded-full px-3 sm:px-4 py-1 flex items-center self-start ${
                isSubscriptionActive 
                  ? 'bg-white/20' 
                  : 'bg-white/20'
              }`}>
                <Crown className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">{subscriptionStatus}</span>
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
                    {/* USO REAL DO PERFIL */}
                    {currentPlan.id === 'admin' ? 'Ilimitado/Ilimitado' : `${currentProfile?.materiais_criados_mes_atual ?? usage.materialsThisMonth}/${currentPlan.limits.materialsPerMonth}`}
                  </span>
                </div>
                
                {/* Progress Bar using shadcn/ui Progress component */}
                <Progress 
                  value={usagePercentage} 
                  className="w-full h-2.5 mb-2" 
                />
                
                <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-500">
                  <span>0</span>
                  <span>{currentPlan.id === 'admin' ? 'Ilimitado' : currentPlan.limits.materialsPerMonth}</span>
                </div>
                
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Renova em {getNextMaterialsResetDate() ? formatDate(getNextMaterialsResetDate()) : formatDate(nextResetDate)}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {currentPlan.id === 'admin' ? 'Ilimitado' : remainingMaterials} restantes
                  </p>
                </div>
                
                {/* Special note for Grupo Escolar plan */}
                {(currentPlan.id === 'grupo_escolar' || currentPlan.id === 'grupo-escolar') && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    <span className="font-medium">Plano Grupo Escolar:</span> Os materiais podem ser distribuídos entre até 5 professores
                  </div>
                )}
                
                {/* Warning messages based on real usage */}
                {usagePercentage >= 80 && typeof remainingMaterials === 'number' && remainingMaterials > 0 && (
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

              {/* Payment Card - Show real payment info based on plan */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
                    <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mr-2" />
                    {isSubscriptionActive ? 'Próximo pagamento' : 'Plano gratuito'}
                  </h3>
                  <span className="text-blue-600 font-bold text-sm sm:text-base">
                    {formatPrice(currentPlan.price.monthly)}
                  </span>
                </div>
                {isSubscriptionActive ? (
                  <>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {getNextPaymentDate() ? `Próximo pagamento em ${formatDate(getNextPaymentDate())}` : '15 de cada mês'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span>Cartão finalizado em 1234</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>Você está no plano gratuito.</p>
                    <p className="mt-1">Faça upgrade para desbloquear mais recursos!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features - Updated with comprehensive resource list */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Recursos incluídos no seu plano:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {getAllResourcesForCurrentPlan().map((resource, index) => {
                  const IconComponent = resource.icon;
                  return (
                    <div key={index} className="flex items-center">
                      {resource.available ? (
                        <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <X className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 mr-2 flex-shrink-0" />
                      )}
                      <IconComponent className="w-3 sm:w-4 h-3 sm:h-4 text-blue-500 mr-2 flex-shrink-0" />
                      <span className={`text-sm ${resource.available ? 'text-gray-700' : 'text-gray-400'}`}>
                        {resource.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">Gerenciar assinatura</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {isSubscriptionActive ? 'Altere ou cancele quando quiser' : 'Faça upgrade para desbloquear todos os recursos'}
                  </p>
                </div>
                
                {/* Desktop Actions - 3 columns with improved responsive design */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {isSubscriptionActive && (
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center text-sm rounded-xl border-2 py-3 hover:bg-gray-50 transition-all duration-200"
                      onClick={() => setIsChangeCardModalOpen(true)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Alterar cartão
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center text-sm rounded-xl border-2 py-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    onClick={() => setIsChangePlanModalOpen(true)}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {isSubscriptionActive ? 'Alterar plano' : 'Fazer upgrade'}
                  </Button>
                  
                  {isSubscriptionActive && (
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center text-sm rounded-xl border-2 py-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 sm:col-span-2 lg:col-span-1"
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cancelar assinatura
                    </Button>
                  )}
                </div>

                {/* Mobile Actions - Full width stacked buttons with rounded borders */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {isSubscriptionActive && (
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center w-full text-sm rounded-xl border-2 py-4 hover:bg-gray-50 transition-all duration-200"
                      onClick={() => setIsChangeCardModalOpen(true)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Alterar cartão
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center w-full text-sm rounded-xl border-2 py-4 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    onClick={() => setIsChangePlanModalOpen(true)}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {isSubscriptionActive ? 'Alterar plano' : 'Fazer upgrade'}
                  </Button>
                  {isSubscriptionActive && (
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center w-full text-sm rounded-xl border-2 py-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cancelar assinatura
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Section - Updated to highlight current plan */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Atualize seu Plano</h1>
              <p className="text-gray-600 text-sm sm:text-base">Escolha o plano que melhor atende às suas necessidades</p>
            </div>
            {/* Billing Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-8">
              <span className="text-sm font-medium text-gray-500">Faturamento:</span>
              <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md gap-1">
                <button
                  onClick={() => setBillingType('mensal')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingType === 'mensal'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingType('anual')}
                  className={`flex flex-row items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingType === 'anual'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Anual
                </button>
                <span className="ml-1">
                  <Badge className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">2 meses grátis</Badge>
                </span>
              </div>
            </div>
          </div>

          {/* Plans Grid - Updated to highlight current plan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              // O admin nunca tem plano atual público
              // Só mostrar PLANO ATUAL se o plano e o tipo de faturamento coincidirem com o real do usuário
              const isCurrentPlan =
                currentPlanId === plan.id &&
                currentPlanId !== 'admin' &&
                billingType === realBillingType;
              const price = billingType === 'mensal' ? plan.price.monthly : plan.price.yearly;
              const yearlyDiscount = getYearlyDiscount(plan);

              console.log('Comparando planos:', { currentPlanId, planId: plan.id, isCurrentPlan });

              return (
                <div
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-xl rounded-xl p-4 sm:p-6 flex flex-col ${
                    plan.popular && !isCurrentPlan ? 'ring-2 ring-blue-500 lg:scale-105 border-2 border-blue-200' : 
                    isCurrentPlan ? 'ring-2 ring-green-500 border-2 border-green-500 bg-green-50' : 
                    'border-2 border-gray-200'
                  }`}
                >
                  {plan.popular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-3 sm:px-4 py-1 text-xs">
                        POPULAR
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-3 sm:px-4 py-1 text-xs">
                        PLANO ATUAL
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
                      {billingType === 'mensal' ? '/mês' : '/ano'}
                    </span>
                    {price > 0 && billingType === 'anual' && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="block text-xs sm:text-sm text-gray-500">
                          {(() => {
                            // Cálculo correto do valor mensal proporcional com 2 meses grátis
                            const monthly = plan.price.monthly;
                            const yearly = plan.price.yearly;
                            const expectedYearly = monthly * 12;
                            // Se o desconto for exatamente 2 meses grátis
                            if (yearly === monthly * 10) {
                              return `ou R$ ${monthly.toFixed(2).replace('.', ',')}/mês`;
                            } else {
                              // Valor proporcional real
                              return `ou R$ ${(yearly / 12).toFixed(2).replace('.', ',')}/mês`;
                            }
                          })()}
                        </span>
                        <Badge className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">2 meses grátis</Badge>
                      </div>
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
                        <p className="text-blue-700 text-xs mt-2">
                          <strong>300 materiais por mês</strong> que podem ser distribuídos flexivelmente entre até 5 professores.
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
                    className={`w-full py-2 sm:py-3 text-sm ${
                      isCurrentPlan
                        ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400'
                        : plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : plan.id === 'grupo-escolar'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    disabled={isCurrentPlan}
                    onClick={() => {
                      if (plan.id === 'gratuito') {
                        if (isSubscriptionActive) {
                          setShowCancelModal(true);
                        } else {
                          handlePlanChange('gratuito');
                        }
                      } else {
                        const link = getPaymentLink(plan.id, billingType);
                        if (link) window.open(link, '_blank');
                      }
                    }}
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
                  O plano Grupo Escolar oferece 300 materiais por mês que podem ser distribuídos flexivelmente entre até 5 professores. O administrador do plano pode ajustar quantos materiais cada professor pode usar por mês, permitindo maior ou menor uso conforme a necessidade de cada um. Ideal tanto para grupos independentes de professores quanto para instituições de ensino.
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
        <AlertDialogContent className="w-[95vw] max-w-md mx-auto rounded-xl border-0">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Cancelar Assinatura
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-sm">
              Tem certeza de que deseja cancelar sua assinatura?
              <br /><br />
              <strong>O que acontecerá:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                <li>Você manterá acesso aos recursos premium até o final do período atual</li>
                <li>Não será cobrado novamente</li>
                <li>Após o vencimento, sua conta será alterada para o plano Gratuito</li>
                <li>Você poderá reativar sua assinatura a qualquer momento</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <AlertDialogCancel className="w-full sm:w-auto h-12 rounded-xl border-2 text-base">
              Manter Assinatura
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelSubscription}
              className="w-full sm:w-auto h-12 rounded-xl bg-red-600 hover:bg-red-700 text-base"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de confirmação de cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowCancelModal(false)}>
              <span className="sr-only">Fechar</span>
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center mb-4">
              <Crown className="w-10 h-10 text-blue-500 mb-2" />
              <h2 className="text-xl font-bold text-center mb-2">Quer realmente cancelar seu plano?</h2>
              <p className="text-gray-600 text-center mb-4">Você vai perder todos os benefícios do plano pago e voltar para o gratuito.</p>
              <textarea
                className="w-full border rounded-lg p-2 text-sm mb-3 resize-none"
                rows={3}
                placeholder="Deixe um feedback (opcional)"
                value={cancelFeedback}
                onChange={e => setCancelFeedback(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Não quero mais cancelar
              </Button>
              <Button
                className="w-full border border-red-400 text-red-600 bg-white hover:bg-red-50"
                onClick={async () => {
                  setIsCancelling(true);
                  // Enviar feedback se houver
                  if (cancelFeedback.trim()) {
                    await activityService.addActivity({
                      type: 'feedback',
                      title: 'Feedback de cancelamento',
                      description: cancelFeedback.trim()
                    });
                  }
                  await handlePlanChange('gratuito');
                  setIsCancelling(false);
                  setShowCancelModal(false);
                  setCancelFeedback('');
                }}
                disabled={isCancelling}
              >
                Quero mesmo cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Função utilitária para conversão
function normalizeBillingType(tipo: any): 'mensal' | 'anual' {
  if (tipo === 'yearly' || tipo === 'anual') return 'anual';
  return 'mensal';
}

// Função para obter o link de pagamento correto
function getPaymentLink(planId: string, billingType: 'mensal' | 'anual') {
  if (planId === 'professor' && billingType === 'mensal') return 'https://pay.kiwify.com.br/kCvmgsB';
  if (planId === 'professor' && billingType === 'anual') return 'https://pay.kiwify.com.br/Goknl68';
  if (planId === 'grupo-escolar' && billingType === 'mensal') return 'https://pay.kiwify.com.br/h22D4Mq';
  if (planId === 'grupo-escolar' && billingType === 'anual') return 'https://pay.kiwify.com.br/pn1Kzjv';
  return '';
}

export default SubscriptionPage;

