
-- Criar tabela webhook_logs se não existir (redundante, mas garantindo)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  evento TEXT NOT NULL,
  produto TEXT,
  plano_aplicado TEXT,
  status TEXT NOT NULL DEFAULT 'sucesso',
  payload JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de logs (necessário para o webhook)
CREATE POLICY IF NOT EXISTS "System can insert webhook logs" 
  ON public.webhook_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Política para administradores visualizarem todos os logs
CREATE POLICY IF NOT EXISTS "Admin can view all webhook logs" 
  ON public.webhook_logs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() 
    AND email = 'medtosdigital@gmail.com'
  ));

-- Criar função para processar webhooks
CREATE OR REPLACE FUNCTION public.process_webhook(
  p_email TEXT,
  p_evento TEXT,
  p_produto TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_plano_aplicado TEXT;
  v_data_expiracao TIMESTAMP WITH TIME ZONE;
  v_resultado JSONB;
BEGIN
  -- Log de início
  RAISE LOG 'Processando webhook para email: %, evento: %', p_email, p_evento;
  
  -- Buscar usuário pelo email
  SELECT user_id INTO v_user_id
  FROM public.perfis
  WHERE email = p_email
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE LOG 'Usuário não encontrado para email: %', p_email;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado',
      'email', p_email
    );
  END IF;
  
  -- Processar diferentes tipos de eventos
  CASE p_evento
    WHEN 'subscription_created', 'subscription_activated', 'subscription_renewed' THEN
      -- Mapear produto para plano
      CASE p_produto
        WHEN 'Plano Professor', 'Professor' THEN
          v_plano_aplicado := 'professor';
          v_data_expiracao := NOW() + INTERVAL '1 month';
        WHEN 'Grupo Escolar', 'Plano Grupo Escolar' THEN
          v_plano_aplicado := 'grupo_escolar';
          v_data_expiracao := NOW() + INTERVAL '1 month';
        ELSE
          v_plano_aplicado := 'professor'; -- Default
          v_data_expiracao := NOW() + INTERVAL '1 month';
      END CASE;
      
      -- Atualizar plano do usuário
      UPDATE public.perfis
      SET 
        plano_ativo = v_plano_aplicado::tipo_plano,
        data_inicio_plano = NOW(),
        data_expiracao_plano = v_data_expiracao,
        materiais_criados_mes_atual = 0,
        ultimo_reset_materiais = NOW(),
        updated_at = NOW()
      WHERE user_id = v_user_id;
      
      RAISE LOG 'Plano atualizado para usuário %: %', v_user_id, v_plano_aplicado;
      
    WHEN 'subscription_cancelled', 'subscription_expired' THEN
      v_plano_aplicado := 'gratuito';
      
      -- Downgrade para plano gratuito
      UPDATE public.perfis
      SET 
        plano_ativo = 'gratuito'::tipo_plano,
        data_expiracao_plano = NULL,
        updated_at = NOW()
      WHERE user_id = v_user_id;
      
      RAISE LOG 'Plano cancelado para usuário %', v_user_id;
      
    ELSE
      RAISE LOG 'Evento não reconhecido: %', p_evento;
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Evento não reconhecido',
        'evento', p_evento
      );
  END CASE;
  
  -- Retornar sucesso
  v_resultado := jsonb_build_object(
    'success', true,
    'message', 'Webhook processado com sucesso',
    'email', p_email,
    'evento', p_evento,
    'plano_aplicado', v_plano_aplicado,
    'user_id', v_user_id
  );
  
  RAISE LOG 'Webhook processado com sucesso: %', v_resultado;
  RETURN v_resultado;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Erro ao processar webhook: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Erro interno: ' || SQLERRM,
    'email', p_email,
    'evento', p_evento
  );
END;
$$;
