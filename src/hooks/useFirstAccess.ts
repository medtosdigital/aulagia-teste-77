import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FirstAccessData {
  nome_preferido: string;
  etapas_ensino: string[];
  anos_serie: string[];
  disciplinas: string[];
  tipo_material_favorito: string[];
  preferencia_bncc: boolean;
  celular: string;
  escola: string;
}

export const useFirstAccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFirstAccess, setIsFirstAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const checkFirstAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar primeiro acesso:', error);
        toast({
          title: "Erro ao verificar acesso",
          description: "Não foi possível verificar seu acesso. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      setIsFirstAccess(!data);
    } catch (error) {
      console.error('Erro inesperado ao verificar acesso:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar suas informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFirstAccessData = async (data: FirstAccessData): Promise<boolean> => {
    if (!user) return false;

    setSaving(true);
    try {
      console.log('Salvando dados do primeiro acesso:', data);

      const updateData = {
        user_id: user.id,
        nome_preferido: data.nome_preferido,
        etapas_ensino: data.etapas_ensino,
        anos_serie: data.anos_serie,
        disciplinas: data.disciplinas,
        tipo_material_favorito: data.tipo_material_favorito,
        preferencia_bncc: data.preferencia_bncc,
        celular: data.celular,
        escola: data.escola,
        plano_ativo: 'gratuito' as const,
        billing_type: 'gratuito'
      };

      const { error } = await supabase
        .from('perfis')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) {
        console.error('Erro ao salvar dados do primeiro acesso:', error);
        toast({
          title: "Erro ao salvar dados",
          description: "Não foi possível salvar suas informações. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Dados do primeiro acesso salvos com sucesso');
      setIsFirstAccess(false);
      
      toast({
        title: "Bem-vindo!",
        description: "Seus dados foram salvos com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar dados:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar suas informações.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkFirstAccess();
    }
  }, [user]);

  return {
    isFirstAccess,
    loading,
    saving,
    saveFirstAccessData,
    checkFirstAccess: () => {
      if (user) {
        checkFirstAccess();
      }
    }
  };
};
