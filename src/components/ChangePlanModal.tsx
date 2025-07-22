
import React, { useState, useMemo } from 'react';
import { Crown, Check, Users, ArrowUpDown, Star, Brain, Presentation, ClipboardList, GraduationCap, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedLoading } from '@/components/ui/optimized-loading';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  materialTypes?: string[];
  popular?: boolean;
}

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: any;
  onPlanChange: (planId: string, billingType: 'mensal' | 'anual') => void;
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);

  const plans: Plan[] = useMemo(() => [
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
      materialTypes: [
        'Planos de Aula completos',
        'Slides interativos',
        'Atividades diversificadas',
        'Avaliações personalizadas'
      ],
      popular: true
    },
    {
      id: 'grupo-escolar',
      name: 'Grupo Escolar',
      price: { monthly: 89.90, yearly: 849 },
      features: [
        'Até 5 professores',
        '300 materiais por mês (total)',
        'Dashboard colaborativo',
        'Suporte prioritário',
        'Distribuição flexível de materiais',
        'Gestão centralizada de usuários'
      ],
      materialTypes: [
        'Todos os tipos do plano Professor',
        'Colaboração entre professores',
        'Gestão centralizada de materiais'
      ]
    }
  ], []);

  const formatPrice = useMemo(() => (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

  const getYearlyDiscount = useMemo(() => (plan: Plan) => {
    const monthlyTotal = plan.price.monthly * 12;
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - plan.price.yearly) / monthlyTotal) * 100);
  }, []);

  const getMaterialTypeIcon = useMemo(() => (materialType: string) => {
    if (materialType.includes('Planos de Aula')) return GraduationCap;
    if (materialType.includes('Slides')) return Presentation;
    if (materialType.includes('Atividades')) return ClipboardList;
    if (materialType.includes('Avaliações')) return FileText;
    if (materialType.includes('Todos os tipos')) return Crown;
    if (materialType.includes('Colaboração')) return Users;
    if (materialType.includes('Gestão')) return Brain;
    return Brain;
  }, []);

  const getPlanBorderColor = useMemo(() => (planId: string) => {
    switch (planId) {
      case 'gratuito':
        return 'border-gray-400';
      case 'professor':
        return 'border-green-500';
      case 'grupo-escolar':
        return 'border-purple-400';
      default:
        return 'border-gray-200';
    }
  }, []);

  function getPaymentLink(planId: string, billingType: 'monthly' | 'yearly') {
    if (planId === 'professor' && billingType === 'monthly') return 'https://pay.kiwify.com.br/kCvmgsB';
    if (planId === 'professor' && billingType === 'yearly') return 'https://pay.kiwify.com.br/Goknl68';
    if (planId === 'grupo-escolar' && billingType === 'monthly') return 'https://pay.kiwify.com.br/h22D4Mq';
    if (planId === 'grupo-escolar' && billingType === 'yearly') return 'https://pay.kiwify.com.br/pn1Kzjv';
    return '';
  }

  const handlePlanChange = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay de API
      onPlanChange(selectedPlan, billingType === 'yearly' ? 'anual' : 'mensal');
      onClose();
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlanData = useMemo(() => 
    plans.find(p => p.id === selectedPlan), 
    [plans, selectedPlan]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg sm:max-w-4xl max-h-[98vh] overflow-visible rounded-xl border-0 p-1 sm:p-3">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ArrowUpDown className="w-5 h-5 text-blue-600" />
            Alterar Plano
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Escolha o plano ideal para você
          </DialogDescription>
        </DialogHeader>

        <OptimizedLoading isLoading={isLoading} fallbackMessage="Alterando plano...">
          <div className="space-y-4 mt-2 pb-32 sm:pb-28">
            {/* Billing Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <span className="text-xs font-medium text-gray-500">Faturamento:</span>
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-full p-0.5 shadow-sm border w-fit flex">
                <button
                  onClick={() => setBillingType('monthly')}
                    className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                    billingType === 'monthly'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingType('yearly')}
                    className={`px-4 py-1 rounded-full text-xs font-medium transition-all ml-1 ${
                    billingType === 'yearly'
                        ? 'bg-blue-600 text-white shadow-sm border-blue-600 border'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Anual
                </button>
              </div>
                <span className="ml-1 bg-green-100 text-green-700 text-[13px] font-semibold px-3 py-1 rounded-full shadow-sm">2 meses grátis</span>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 overflow-y-auto max-h-[60vh] sm:max-h-none px-1 sm:px-0">
              {plans.map((plan) => {
                const isCurrentPlan = currentPlan.id === plan.id;
                const price = billingType === 'monthly' ? plan.price.monthly : plan.price.yearly;
                const yearlyDiscount = getYearlyDiscount(plan);
                const isSelected = selectedPlan === plan.id;
                const borderColor = getPlanBorderColor(plan.id);
                const isPaid = plan.id !== 'gratuito' && price > 0;

                return (
                  <div
                    key={plan.id}
                    className={`relative cursor-pointer transition-all duration-300 border-2 rounded-2xl pt-4 pb-1 px-3 min-h-[320px] max-h-[420px] overflow-visible flex flex-col items-start ${
                      isCurrentPlan ? 'border-green-500' : plan.popular ? 'border-blue-400' : 'border-gray-300'
                    } bg-white shadow-sm ${
                      isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {/* BADGES */}
                    {plan.popular && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                        <span className="bg-blue-500 text-white font-bold px-4 py-1 text-[13px] rounded-full shadow border-2 border-white uppercase tracking-wide">POPULAR</span>
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                        <span className="bg-green-500 text-white font-bold px-4 py-1 text-[13px] rounded-full shadow border-2 border-white uppercase tracking-wide">PLANO ATUAL</span>
                      </div>
                    )}

                    {/* Nome do plano e preço alinhados ao topo */}
                    <div className="w-full flex flex-col items-start mb-2 mt-0">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight">{plan.name}</h3>
                      {plan.id === 'professor' && (
                        <span className="text-sm text-gray-500 mb-0">Para professores que querem mais recursos</span>
                      )}
                      {plan.id === 'grupo-escolar' && (
                        <span className="text-sm text-gray-500 mb-0">Para grupos de professores e instituições de ensino</span>
                      )}
                      {plan.id === 'gratuito' && (
                        <span className="text-sm text-gray-500 mb-0">Ideal para quem quer testar a plataforma</span>
                      )}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-2xl font-bold text-gray-800">
                        {price === 0 ? 'R$ 0' : formatPrice(price)}
                      </span>
                        <span className="text-gray-500 text-base">
                        {billingType === 'monthly' ? '/mês' : '/ano'}
                        </span>
                        {isPaid && billingType === 'yearly' && (
                          <span className="bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1">2 meses grátis</span>
                        )}
                        {isPaid && billingType === 'yearly' && yearlyDiscount > 0 && (
                          <span className="block text-xs text-gray-500 ml-1">
                            ou {formatPrice(plan.price.monthly)}/mês
                        </span>
                      )}
                      </div>
                    </div>

                    {/* Special highlight for Grupo Escolar plan */}
                    {plan.id === 'grupo-escolar' && (
                      <div className="mb-2">
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <h4 className="font-semibold text-blue-800 mb-1 flex items-center text-xs">
                            <Crown className="w-3 h-3 text-blue-600 mr-1" />
                            300 materiais/mês
                          </h4>
                          <p className="text-blue-700 text-[10px]">
                            Até 5 professores.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Material Types Section */}
                    {plan.materialTypes && plan.materialTypes.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-semibold text-gray-800 mb-1 flex items-center text-xs">
                          <Brain className="w-3 h-3 text-blue-600 mr-1" />
                          Tipos de Materiais
                        </h4>
                        <div className="space-y-1">
                          {plan.materialTypes.map((materialType, index) => {
                            const MaterialIcon = getMaterialTypeIcon(materialType);
                            return (
                              <div key={index} className="flex items-start">
                                <MaterialIcon className="w-3 h-3 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-[11px] sm:text-xs">{materialType}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <ul className="space-y-1 mb-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-xs text-gray-700">
                          <Check className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Current Plan Info */}
            {/* Removido bloco de mudança de plano abaixo dos cards */}

            {/* Pop-up de confirmação para upgrade */}
            {showUpgradeConfirm && (
              <Dialog open={showUpgradeConfirm} onOpenChange={setShowUpgradeConfirm}>
                <DialogContent className="max-w-xs rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg">Confirmar mudança de plano</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-gray-700 mb-4">Tem certeza que deseja mudar para o plano <strong>{selectedPlanData?.name}</strong>?</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowUpgradeConfirm(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 border-green-700 text-white font-semibold shadow" onClick={() => {
                      setShowUpgradeConfirm(false);
                      const link = getPaymentLink(selectedPlan, billingType);
                      if (link) window.open(link, '_blank');
                    }}>
                      Confirmar
                    </Button>
              </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {/* Botões fixos na base do modal */}
          <div className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 px-2 sm:px-4 py-3 flex flex-col sm:flex-row justify-end gap-2 max-w-lg sm:max-w-4xl mx-auto rounded-b-xl">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto h-12 rounded-xl border-2 text-base"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
              onClick={() => {
                if (selectedPlan === 'gratuito') {
                  setShowCancelModal(true);
                } else {
                  setShowUpgradeConfirm(true);
                }
              }}
              disabled={!selectedPlan || isLoading}
                className="w-full sm:w-auto h-12 rounded-xl text-base bg-green-600 hover:bg-green-700 border-green-700 text-white font-semibold shadow"
            >
              {isLoading ? 'Atualizando...' : selectedPlan === 'gratuito' ? 'Mudar para Gratuito' : 'Fazer Upgrade'}
            </Button>
          </div>
        </OptimizedLoading>
      </DialogContent>
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
                    // Aqui você pode enviar o feedback para o backend
                  }
                  await onPlanChange('gratuito', 'mensal'); // Assuming 'gratuito' is the free plan and 'mensal' is the billing type
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
    </Dialog>
  );
};
