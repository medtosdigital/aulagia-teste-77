-- Adicionar campo billing_type à tabela perfis se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'billing_type'
    ) THEN
        ALTER TABLE public.perfis ADD COLUMN billing_type TEXT DEFAULT 'gratuito';
    END IF;
END $$;

-- Atualizar tabela webhook_logs para incluir billing_type se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'webhook_logs' AND column_name = 'billing_type'
    ) THEN
        ALTER TABLE public.webhook_logs ADD COLUMN billing_type TEXT;
    END IF;
END $$;

-- Criar índice para billing_type na tabela perfis
CREATE INDEX IF NOT EXISTS idx_perfis_billing_type ON public.perfis(billing_type);

-- Criar índice para billing_type na tabela webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_billing_type ON public.webhook_logs(billing_type); 