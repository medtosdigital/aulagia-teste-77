-- Recriar tabela webhook_logs com todos os campos necessários
DROP TABLE IF EXISTS public.webhook_logs CASCADE;

CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  evento TEXT NOT NULL,
  produto TEXT,
  plano_aplicado TEXT,
  billing_type TEXT,
  status TEXT NOT NULL,
  erro_mensagem TEXT,
  ip_address TEXT,
  user_agent TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_webhook_logs_email ON public.webhook_logs(email);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_billing_type ON public.webhook_logs(billing_type);

-- Garantir que a tabela perfis tem billing_type
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'billing_type'
    ) THEN
        ALTER TABLE public.perfis ADD COLUMN billing_type TEXT DEFAULT 'gratuito';
    END IF;
END $$;

-- Criar índice para billing_type na tabela perfis
CREATE INDEX IF NOT EXISTS idx_perfis_billing_type ON public.perfis(billing_type); 