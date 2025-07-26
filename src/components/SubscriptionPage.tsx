
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/hooks/useAuth';
import { planService } from '@/services/planService';
import { useNavigate } from 'react-router-dom';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { CheckCheck, Copy, UserCheck, Wallet } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { UpgradeModal } from './UpgradeModal';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentPlan, currentProfile } = usePlanPermissions();
  const { showUpgradeModal, triggerUpgradeModal, closeUpgradeModal } = useUpgradeModal();

  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if has active plan based on currentPlan
  const hasActivePlan = currentPlan.id !== 'gratuito';

  useEffect(() => {
    if (user) {
      setApiKey(user.id);
    }
  }, [user]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({
      title: "API Key copiada!",
      description: "Cole a API Key no seu projeto.",
    })
    setTimeout(() => {
      setCopied(false);
    }, 3000);
    trackActivity('copyApiKey', { apiKey });
  };

  const handleBillingClick = () => {
    navigate('/billing');
    trackActivity('goToBilling', {});
  };

  const trackActivity = (action: string, details: any) => {
    try {
      // Simple console log for now since activityTracker is missing
      console.log('Activity tracked:', action, details);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const renderPlanDetails = () => {
    if (!currentProfile) {
      return <p>Carregando informações do plano...</p>;
    }

    return (
      <>
        <div className="grid gap-2">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Plano Atual</h4>
            <p className="text-sm text-muted-foreground">{currentProfile.plano_ativo}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Status do Plano</h4>
            <p className="text-sm text-muted-foreground">{currentProfile.status_plano || 'ativo'}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Tipo de Cobrança</h4>
            <p className="text-sm text-muted-foreground">{currentProfile.billing_type}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Data de Início do Plano</h4>
            <p className="text-sm text-muted-foreground">{new Date(currentProfile.data_inicio_plano).toLocaleDateString()}</p>
          </div>
          {currentProfile.data_expiracao_plano && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Data de Expiração do Plano</h4>
              <p className="text-sm text-muted-foreground">{new Date(currentProfile.data_expiracao_plano).toLocaleDateString()}</p>
            </div>
          )}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Materiais Criados Este Mês</h4>
            <p className="text-sm text-muted-foreground">{currentProfile.materiais_criados_mes_atual || 0}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <Button onClick={handleBillingClick} className="w-full">
          Gerenciar Assinatura
        </Button>
      </>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Assinatura</CardTitle>
            <CardDescription>
              Gerencie sua assinatura e API Key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex items-center">
                  <Input
                    id="api-key"
                    className="mr-2"
                    type="text"
                    value={apiKey}
                    readOnly
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyClick}
                    disabled={copied}
                  >
                    {copied ? <CheckCheck className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
              </div>
              {hasActivePlan ? (
                renderPlanDetails()
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">Você não possui uma assinatura ativa.</p>
                  <Button onClick={() => triggerUpgradeModal('noPlan')} className="mt-4">
                    Assinar Agora
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={closeUpgradeModal}
        onPlanSelect={() => {}}
        currentPlan={currentPlan}
      />
    </div>
  );
};

export default SubscriptionPage;
