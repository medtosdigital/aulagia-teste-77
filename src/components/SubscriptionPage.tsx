import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/components/ui/use-toast"
import { planService } from '@/services/planService';
import { activityService } from '@/services/activityService';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useSupabase } from '@/providers/SupabaseProvider';

interface SubscriptionPageProps {
  // Define props here if needed
}

// Define valid activity types
type ActivityType = "created" | "exported" | "updated" | "scheduled";

const SubscriptionPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast()
    const { isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal, requiredPlan } = useUpgradeModal();
    const { supabase } = useSupabase();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userProfile = await planService.getUserProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao carregar os dados do perfil."
        })
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const logActivity = (activityType: string, title: string, description: string) => {
    // Fix: Ensure activityType matches the expected union type
    const validActivityTypes = ["created", "exported", "updated", "scheduled"];
    const normalizedType = validActivityTypes.includes(activityType) ? activityType : "created";
    
    activityService.logActivity({
      type: normalizedType as "created" | "exported" | "updated" | "scheduled",
      title,
      description,
      material_type: undefined,
      material_id: undefined,
      subject: undefined,
      grade: undefined
    });
  };

  if (loading) {
    return <div>Carregando informações...</div>;
  }

  if (!profile) {
    return <div>Falha ao carregar o perfil.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Seu Plano Atual: {profile.plano_ativo}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="text-lg font-semibold">Detalhes do Plano</h3>
            <p>Status: {profile.status_plano}</p>
            <p>Tipo de Cobrança: {profile.billing_type}</p>
            <p>Início do Plano: {new Date(profile.data_inicio_plano).toLocaleDateString()}</p>
            <p>Expiração do Plano: {new Date(profile.data_expiracao_plano).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Uso Mensal de Materiais</h3>
            <p>Materiais Criados Este Mês: {profile.materiais_criados_mes_atual}</p>
            <Progress value={(profile.materiais_criados_mes_atual / 100) * 100} />
          </div>

          <Button onClick={() => openUpgradeModal()}>
            Mudar de Plano
          </Button>
        </CardContent>
      </Card>
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={closeUpgradeModal}
                requiredPlan={requiredPlan}
            />
    </div>
  );
};

export default SubscriptionPage;
