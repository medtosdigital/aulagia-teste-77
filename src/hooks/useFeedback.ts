
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFeedback = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const submitFeedback = async (message: string, type: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar feedback.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('feedbacks')
        .insert([{
          message,
          type,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Feedback enviado",
        description: "Obrigado pelo seu feedback! Ele foi enviado com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserFeedbacks = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
      return [];
    }
  };

  return {
    submitFeedback,
    getUserFeedbacks,
    loading
  };
};
