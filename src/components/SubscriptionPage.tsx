import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useSubscription } from '@stripe/react-stripe-js';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { Separator } from "@/components/ui/separator"
import { planService } from '@/services/planService';
import { activityService } from '@/services/activityService';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useProModal } from '@/hooks/useProModal';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionPlan {
  name: string;
  description: string;
  features: string[];
  price: string;
  stripePriceId: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Free",
    description: "Plano gratuito com recursos limitados",
    features: ["Acesso limitado a modelos", "5 materiais por mês", "Suporte básico"],
    price: "Grátis",
    stripePriceId: "",
  },
  {
    name: "Pro",
    description: "Acesso total a todos os recursos",
    features: ["Acesso ilimitado a modelos", "Criação ilimitada de materiais", "Suporte prioritário", "Recursos avançados"],
    price: "R$29,90/mês",
    stripePriceId: "price_1P14otI8G4iae2WwG6ohEd4K",
  },
];

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, loading: stripeLoading } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const { openModal } = useUpgradeModal();
  const proModal = useProModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubscribe = async (stripePriceId: string, planName: string) => {
    if (!user) {
      toast({
        title: "Não autenticado.",
        description: "Por favor, faça login para continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const session = await planService.createCheckoutSession(stripePriceId);

      if (session?.url) {
        window.location.href = session.url;
        toast({
          title: "Redirecionando para o pagamento...",
          description: "Você será redirecionado para o Stripe para completar o pagamento.",
        });
      } else {
        toast({
          title: "Erro ao criar sessão de checkout.",
          description: "Por favor, tente novamente mais tarde.",
          variant: "destructive",
        });
      }

      await activityService.logActivity({
        type: 'created' as const,
        title: `Plano ${planName} assinado`,
        description: `Assinatura realizada em ${new Date().toLocaleDateString('pt-BR')}`,
        materialType: undefined,
        materialId: undefined
      });

    } catch (error: any) {
      console.error("Erro ao iniciar assinatura:", error);
      toast({
        title: "Erro ao iniciar assinatura.",
        description: error.message || "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) {
      toast({
        title: "Não autenticado.",
        description: "Por favor, faça login para continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (subscription?.cancel_at_period_end === false) {
        await planService.cancelSubscription();
        toast({
          title: "Assinatura cancelada.",
          description: "Sua assinatura foi cancelada e não será renovada.",
        });
      } else {
        toast({
          title: "Assinatura já cancelada.",
          description: "Sua assinatura já foi cancelada e não será renovada.",
          variant: "destructive",
        });
      }

            await activityService.logActivity({
              type: 'created' as const, // Fix the type error
              title: `Plano ${subscription.planName} cancelado`,
              description: `Assinatura cancelada em ${new Date().toLocaleDateString('pt-BR')}`,
              materialType: undefined,
              materialId: undefined
            });

    } catch (error: any) {
      console.error("Erro ao cancelar assinatura:", error);
      toast({
        title: "Erro ao cancelar assinatura.",
        description: error.message || "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPro = isMounted && subscription?.planName === "Pro";
  const billingType = isPro ? subscription?.billingType : "free";

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciar Assinatura
        </h1>
        <p className="text-gray-600">
          Escolha o plano que melhor se adapta às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-500">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-sm text-gray-700">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <div className="text-xl font-bold text-gray-900">{plan.price}</div>
              {plan.name === "Pro" ? (
                <>
                  {isPro ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Assinatura ativa ({billingType})
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan.stripePriceId, plan.name)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        "Assinar"
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    openModal("Recurso Pro", "Este recurso está disponível apenas no plano Pro.");
                  }}
                  disabled={isPro}
                >
                  {isPro ? "Plano Atual" : "Plano Gratuito"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />

      {isPro && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Assinatura</CardTitle>
            <CardDescription>
              Cancele ou gerencie sua assinatura Pro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Sua assinatura Pro será renovada automaticamente.
              </p>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Cancelar Assinatura"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionPage;
