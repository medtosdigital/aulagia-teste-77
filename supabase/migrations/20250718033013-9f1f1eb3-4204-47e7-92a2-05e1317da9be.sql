
-- Criar tabela para logs dos webhooks
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  evento TEXT NOT NULL,
  produto TEXT,
  plano_aplicado TEXT,
  status TEXT NOT NULL DEFAULT 'sucesso',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  payload JSONB
);

-- Habilitar RLS na tabela
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem ver todos os logs
CREATE POLICY "Admins can view all webhook logs" 
  ON public.webhook_logs 
  FOR SELECT 
  USING (EXISTS ( 
    SELECT 1 FROM planos_usuarios p 
    WHERE p.user_id = auth.uid() AND p.plano_ativo = 'admin'::tipo_plano
  ));

-- Política para sistema poder inserir logs
CREATE POLICY "System can insert webhook logs" 
  ON public.webhook_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Índices para melhor performance
CREATE INDEX idx_webhook_logs_email ON public.webhook_logs(email);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_evento ON public.webhook_logs(evento);
