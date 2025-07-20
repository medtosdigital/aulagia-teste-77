-- Remover COMPLETAMENTE todos os triggers e funções que estão causando "Database error saving new user"
-- Esta é uma solução temporária para permitir que usuários sejam criados

-- 1. Remover TODOS os triggers possíveis
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile_complete ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_safe ON auth.users;

-- 2. Remover TODAS as funções relacionadas
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_plan();
DROP FUNCTION IF EXISTS public.handle_new_user_profile_complete();
DROP FUNCTION IF EXISTS public.handle_new_user_simple();
DROP FUNCTION IF EXISTS public.create_user_profile_safe();

-- 3. Garantir que a tabela perfis existe e tem as colunas necessárias
DO $$ 
BEGIN
    -- Criar tabela perfis se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perfis') THEN
        CREATE TABLE public.perfis (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            email TEXT,
            full_name TEXT,
            nome_preferido TEXT,
            etapas_ensino TEXT[],
            disciplinas TEXT[],
            anos_serie TEXT[],
            preferencia_bncc BOOLEAN DEFAULT false,
            tipo_material_favorito TEXT[],
            plano_ativo tipo_plano DEFAULT 'gratuito',
            billing_type TEXT DEFAULT 'gratuito',
            celular TEXT,
            escola TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
    END IF;
    
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

-- 4. Habilitar RLS na tabela perfis
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS corretas
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

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_perfis_user_id ON public.perfis(user_id);
CREATE INDEX IF NOT EXISTS idx_perfis_email ON public.perfis(email);
CREATE INDEX IF NOT EXISTS idx_perfis_plano_ativo ON public.perfis(plano_ativo);
CREATE INDEX IF NOT EXISTS idx_perfis_billing_type ON public.perfis(billing_type);

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_perfis_updated_at ON public.perfis;
CREATE TRIGGER update_perfis_updated_at
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 