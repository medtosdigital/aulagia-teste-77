-- Criar tabela perfis para armazenar dados do usuário
CREATE TABLE public.perfis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_preferido TEXT,
  etapas_ensino TEXT[],
  disciplinas TEXT[],
  anos_serie TEXT[],
  preferencia_bncc BOOLEAN DEFAULT false,
  tipo_material_favorito TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Criar políticas para a tabela perfis
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

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at na tabela perfis
CREATE TRIGGER update_perfis_updated_at
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Atualizar os tipos do Supabase para incluir a nova tabela
