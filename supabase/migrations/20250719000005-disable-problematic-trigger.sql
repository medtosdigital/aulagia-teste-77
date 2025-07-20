-- Desabilitar temporariamente o trigger problemático que está causando "Database error saving new user"
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile_complete ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;

-- Remover funções problemáticas
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_plan();
DROP FUNCTION IF EXISTS public.handle_new_user_profile_complete();
DROP FUNCTION IF EXISTS public.handle_new_user_simple();

-- Garantir que a tabela perfis tem todas as colunas necessárias
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

-- Criar função simples e segura para criação de perfil
CREATE OR REPLACE FUNCTION public.create_user_profile_safe()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil apenas com campos essenciais e seguros
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
    ON CONFLICT (user_id) DO NOTHING; -- Não fazer nada em caso de conflito
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de qualquer erro, apenas retornar NEW sem interromper o processo
        RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger seguro
CREATE TRIGGER on_auth_user_created_safe
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile_safe();

-- Garantir que as políticas RLS estão corretas
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