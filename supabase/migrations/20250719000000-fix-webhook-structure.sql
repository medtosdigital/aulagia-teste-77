-- Garantir que o campo plano_ativo existe na tabela perfis
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'plano_ativo'
    ) THEN
        ALTER TABLE public.perfis ADD COLUMN plano_ativo tipo_plano DEFAULT 'gratuito'::tipo_plano;
    END IF;
END $$;

-- Criar tabela webhook_logs se não existir
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  evento TEXT NOT NULL,
  produto TEXT,
  plano_aplicado TEXT,
  status TEXT NOT NULL,
  erro_mensagem TEXT,
  ip_address TEXT,
  user_agent TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_email ON public.webhook_logs(email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);

-- Garantir que a tabela planos_usuarios existe
CREATE TABLE IF NOT EXISTS public.planos_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plano_ativo tipo_plano NOT NULL DEFAULT 'gratuito',
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_expiracao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Habilitar RLS na tabela webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de logs (apenas para admins)
CREATE POLICY IF NOT EXISTS "Admins can insert webhook logs" 
    ON public.webhook_logs 
    FOR INSERT 
    WITH CHECK (true);

-- Política para permitir leitura de logs (apenas para admins)
CREATE POLICY IF NOT EXISTS "Admins can view webhook logs" 
    ON public.webhook_logs 
    FOR SELECT 
    USING (true); 