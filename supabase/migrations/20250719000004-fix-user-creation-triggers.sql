-- Corrigir problemas na criação de usuários
-- 1. Remover triggers conflitantes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile_complete ON auth.users;

-- 2. Remover funções conflitantes
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_plan();
DROP FUNCTION IF EXISTS public.handle_new_user_profile_complete();

-- 3. Verificar se todas as colunas necessárias existem na tabela perfis
DO $$ 
BEGIN
    -- Adicionar colunas que podem estar faltando
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'email') THEN
        ALTER TABLE public.perfis ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'full_name') THEN
        ALTER TABLE public.perfis ADD COLUMN full_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'plano_ativo') THEN
        ALTER TABLE public.perfis ADD COLUMN plano_ativo tipo_plano DEFAULT 'gratuito';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'data_inicio_plano') THEN
        ALTER TABLE public.perfis ADD COLUMN data_inicio_plano TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'data_expiracao_plano') THEN
        ALTER TABLE public.perfis ADD COLUMN data_expiracao_plano TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'materiais_criados_mes_atual') THEN
        ALTER TABLE public.perfis ADD COLUMN materiais_criados_mes_atual INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'ano_atual') THEN
        ALTER TABLE public.perfis ADD COLUMN ano_atual INTEGER DEFAULT EXTRACT(YEAR FROM NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'mes_atual') THEN
        ALTER TABLE public.perfis ADD COLUMN mes_atual INTEGER DEFAULT EXTRACT(MONTH FROM NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'ultimo_reset_materiais') THEN
        ALTER TABLE public.perfis ADD COLUMN ultimo_reset_materiais TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', now());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'billing_type') THEN
        ALTER TABLE public.perfis ADD COLUMN billing_type TEXT DEFAULT 'gratuito';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'celular') THEN
        ALTER TABLE public.perfis ADD COLUMN celular TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'escola') THEN
        ALTER TABLE public.perfis ADD COLUMN escola TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.perfis ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 4. Criar função única e simplificada para criação de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil básico apenas com campos essenciais
    INSERT INTO public.perfis (
        user_id, 
        email, 
        full_name,
        plano_ativo,
        billing_type
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'gratuito'::tipo_plano,
        'gratuito'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, perfis.full_name),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger único
CREATE TRIGGER on_auth_user_created_simple
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_perfis_user_id ON public.perfis(user_id);
CREATE INDEX IF NOT EXISTS idx_perfis_email ON public.perfis(email);
CREATE INDEX IF NOT EXISTS idx_perfis_plano_ativo ON public.perfis(plano_ativo);
CREATE INDEX IF NOT EXISTS idx_perfis_billing_type ON public.perfis(billing_type);

-- 7. Garantir que as políticas RLS estão corretas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON public.perfis;

CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.perfis 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.perfis 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
  ON public.perfis 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu próprio perfil" 
  ON public.perfis 
  FOR DELETE 
  USING (auth.uid() = user_id); 