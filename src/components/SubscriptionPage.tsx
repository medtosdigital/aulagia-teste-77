import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { planService } from '@/services/planService';
import { PerfilUsuario } from '@/services/planService';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { Loader2 } from 'lucide-react';

const SubscriptionPage: React.FC = () => {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { trackActivity } = useActivityTracker();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userProfile = await planService.getUserProfile();
        setProfile(userProfile);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpgrade = async (planName: string) => {
    if (!user) {
      console.error('Usuário não autenticado');
      toast.error('Erro de autenticação');
      return;
    }

    try {
      setIsLoading(true);
      
      // Track the upgrade attempt with a valid activity type
      trackActivity('created', { // Mudado de 'feedback' para 'created'
        type: 'subscription',
        title: `Upgrade para ${planName}`,
        description: `Tentativa de upgrade para o plano ${planName}`,
        grade: '',
        subject: ''
      });

      // Chame a função de upgrade do plano aqui (simulação)
      // Substitua esta simulação pela lógica real de upgrade do plano
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula uma chamada de API

      toast.success(`Upgrade para ${planName} solicitado!`, {
        description: 'Estamos processando sua solicitação. Verifique sua conta em breve.'
      });

      // Redirecione para a página de materiais após o upgrade (simulação)
      router.push('/materiais');
    } catch (error) {
      console.error('Erro ao solicitar upgrade:', error);
      toast.error('Erro ao solicitar upgrade', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          {profile ? (
            <>
              <p>
                <strong>Plano atual:</strong> {profile.plano_ativo}
              </p>
              <p>
                <strong>Status do plano:</strong> {profile.status_plano}
              </p>
              <p>
                <strong>Data de início do plano:</strong> {profile.data_inicio_plano}
              </p>
              <p>
                <strong>Data de expiração do plano:</strong> {profile.data_expiracao_plano}
              </p>
              <div className="mt-4">
                <Button onClick={() => handleUpgrade('Professor')} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    'Upgrade para Plano Professor'
                  )}
                </Button>
                <Button onClick={() => handleUpgrade('Grupo Escolar')} className="ml-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    'Upgrade para Plano Grupo Escolar'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <p>Carregando informações do plano...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
