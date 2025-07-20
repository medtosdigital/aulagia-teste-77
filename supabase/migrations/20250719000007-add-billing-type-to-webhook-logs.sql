-- Adicionar campo billing_type na tabela webhook_logs
-- Este campo será usado para registrar o tipo de cobrança (mensal/anual) dos webhooks

-- 1. Verificar se a tabela webhook_logs existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_logs') THEN
        -- Criar tabela webhook_logs se não existir
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
        
        RAISE NOTICE 'Tabela webhook_logs criada com billing_type';
    ELSE
        -- Adicionar campo billing_type se a tabela já existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'billing_type') THEN
            ALTER TABLE public.webhook_logs ADD COLUMN billing_type TEXT;
            RAISE NOTICE 'Campo billing_type adicionado à tabela webhook_logs';
        ELSE
            RAISE NOTICE 'Campo billing_type já existe na tabela webhook_logs';
        END IF;
    END IF;
END $$;

-- 2. Criar índice para billing_type se não existir
CREATE INDEX IF NOT EXISTS idx_webhook_logs_billing_type ON public.webhook_logs(billing_type);

-- 3. Verificar se outros campos importantes existem
DO $$ 
BEGIN
    -- Adicionar campo erro_mensagem se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'erro_mensagem') THEN
        ALTER TABLE public.webhook_logs ADD COLUMN erro_mensagem TEXT;
    END IF;
    
    -- Adicionar campo ip_address se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE public.webhook_logs ADD COLUMN ip_address TEXT;
    END IF;
    
    -- Adicionar campo user_agent se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE public.webhook_logs ADD COLUMN user_agent TEXT;
    END IF;
    
    -- Adicionar campo payload se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'payload') THEN
        ALTER TABLE public.webhook_logs ADD COLUMN payload JSONB;
    END IF;
END $$;

-- 4. Criar índices adicionais se não existirem
CREATE INDEX IF NOT EXISTS idx_webhook_logs_email ON public.webhook_logs(email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_evento ON public.webhook_logs(evento);

-- 5. Verificar estrutura final da tabela
DO $$ 
DECLARE
    column_record RECORD;
BEGIN
    RAISE NOTICE 'Estrutura final da tabela webhook_logs:';
    FOR column_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'webhook_logs' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  %: % (nullable: %, default: %)', 
            column_record.column_name, 
            column_record.data_type, 
            column_record.is_nullable, 
            column_record.column_default;
    END LOOP;
END $$; 