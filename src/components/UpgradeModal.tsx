import React, { useState } from 'react';
import { Crown, Check, Users, X, Star, Brain, Presentation, ClipboardList, GraduationCap, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  materialTypes: string[];
  popular?: boolean;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: any;
  onPlanSelect: (planId: string, billingType: 'mensal' | 'anual') => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  currentPlan,
  onPlanSelect 
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const plans: Plan[] = [
    {
      id: 'professor',
      name: 'Professor',
      price: { monthly: 29.90, yearly: 299 },
      features: [
        '50 materiais por mês',
        'Download em PDF, Word e PPT',
        'Edição completa de materiais',
        'Calendário de aulas',
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
        'Todos os recursos do plano Professor',
        'Colaboração entre professores',
        'Gestão centralizada de materiais'
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

  const getMaterialTypeIcon = (materialType: string) => {
    if (materialType.includes('Planos de Aula')) return GraduationCap;
    if (materialType.includes('Slides')) return Presentation;
    if (materialType.includes('Atividades')) return ClipboardList;
    if (materialType.includes('Avaliações')) return FileText;
    if (materialType.includes('Todos os recursos')) return Crown;
    if (materialType.includes('Colaboração')) return Users;
    if (materialType.includes('Gestão')) return Brain;
    return Brain;
  };

  function getPaymentLink(planId: string, billingType: 'monthly' | 'yearly') {
    if (planId === 'professor' && billingType === 'monthly') return 'https://pay.kiwify.com.br/kCvmgsB';
    if (planId === 'professor' && billingType === 'yearly') return 'https://pay.kiwify.com.br/Goknl68';
    if (planId === 'grupo-escolar' && billingType === 'monthly') return 'https://pay.kiwify.com.br/h22D4Mq';
    if (planId === 'grupo-escolar' && billingType === 'yearly') return 'https://pay.kiwify.com.br/pn1Kzjv';
    return '';
  }

  const handlePlanSelection = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    
    try {
      await onPlanSelect(selectedPlan, billingType === 'yearly' ? 'anual' : 'mensal');
      onClose();
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Se não estiver logado, mostrar mensagem de login
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-md max-h-[95vh] overflow-y-auto rounded-xl border-0 p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Crown className="w-6 h-6 text-blue-600" />
              Faça Login
            </DialogTitle>
            <DialogDescription className="text-center">
              Você precisa estar logado para fazer upgrade do seu plano.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={onClose} className="w-full">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mostrar apenas se o plano atual foi carregado
  const currentPlanName = currentPlan?.name || 'Carregando...';
  const isCurrentPlanLoading = currentPlan?.id === 'carregando' || !currentPlan;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Crown className="w-5 h-5 text-blue-600" />
            Acesso Limitado
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isCurrentPlanLoading ? (
              "Carregando informações do seu plano..."
            ) : (
              `Você atingiu o limite do seu plano ${currentPlanName}. Faça upgrade para continuar criando materiais incríveis!`
            )}
          </DialogDescription>
        </DialogHeader>

        {isCurrentPlanLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {plans.map((plan) => {
                const price = billingType === 'monthly' ? plan.price.monthly : plan.price.yearly;
                const yearlyDiscount = getYearlyDiscount(plan);
                const isSelected = selectedPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative cursor-pointer transition-all duration-300 border-2 rounded-xl p-4 sm:p-6 ${
                      plan.popular ? 'ring-2 ring-blue-500' : ''
                    } ${
                      isSelected ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-300' : 'hover:shadow-lg border-gray-200'
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

                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h3>
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-800">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {billingType === 'monthly' ? '/mês' : '/ano'}
                      </span>
                      {billingType === 'yearly' && (
                        <>
                          <span className="block text-sm text-gray-500">
                            ou {formatPrice(plan.price.yearly / 12)}/mês
                          </span>
                          <span className="inline-block ml-2 align-middle">
                            <Badge className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">2 meses grátis</Badge>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Special highlight for Grupo Escolar plan */}
                    {plan.id === 'grupo-escolar' && (
                      <div className="mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="font-semibold text-blue-800 mb-2 flex items-center text-sm">
                            <Crown className="w-4 h-4 text-blue-600 mr-2" />
                            300 materiais por mês
                          </h4>
                          <p className="text-blue-700 text-xs">
                            Total de materiais que podem ser distribuídos flexivelmente entre até 5 professores.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Material Types Section */}
                    {plan.materialTypes && plan.materialTypes.length > 0 && (
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

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto h-12 rounded-xl border-2 text-base"
              >
                <X className="w-4 h-4 mr-2" />
                Continuar com plano atual
              </Button>
              <Button 
                onClick={() => {
                  if (selectedPlan === 'gratuito') {
                    setShowCancelModal(true);
                  } else {
                    const link = getPaymentLink(selectedPlan, billingType);
                    if (link) window.open(link, '_blank');
                  }
                }}
                disabled={!selectedPlan || isLoading}
                className="w-full sm:w-auto h-12 rounded-xl text-base"
              >
                {isLoading ? 'Atualizando...' : selectedPlan === 'gratuito' ? 'Mudar para Gratuito' : 'Fazer Upgrade'}
              </Button>
            </div>
          </div>
        )}
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
                  await onPlanSelect('gratuito', 'mensal'); // Assuming 'gratuito' is monthly
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
