
-- 1. Ajustar tabela de perfis unificada
-- Primeiro, vamos migrar dados da tabela profiles para perfis
INSERT INTO public.perfis (user_id, nome_preferido, created_at, updated_at)
SELECT 
    id as user_id,
    full_name as nome_preferido,
    created_at,
    updated_at
FROM public.profiles
ON CONFLICT (user_id) DO UPDATE SET
    nome_preferido = COALESCE(EXCLUDED.nome_preferido, perfis.nome_preferido),
    updated_at = EXCLUDED.updated_at;

-- Adicionar colunas que existiam na tabela profiles à tabela perfis
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Migrar dados restantes da profiles para perfis
UPDATE public.perfis 
SET 
    avatar_url = p.avatar_url,
    email = p.email,
    full_name = p.full_name
FROM public.profiles p
WHERE perfis.user_id = p.id;

-- Remover tabela profiles
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Criar tabela unificada de materiais
CREATE TABLE public.materiais (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    tipo_material TEXT NOT NULL CHECK (tipo_material IN ('plano-de-aula', 'atividade', 'slides', 'avaliacao', 'apoio')),
    disciplina TEXT,
    serie TEXT,
    conteudo TEXT NOT NULL,
    template_usado TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Campos específicos de planos de aula
    periodo_inicio DATE,
    periodo_fim DATE,
    dias_semana TEXT[],
    meses JSONB,
    semanas JSONB,
    avaliacoes INTEGER,
    observacoes TEXT,
    
    -- Campos específicos de materiais de apoio
    material_principal_id UUID,
    tema TEXT,
    turma TEXT,
    status TEXT DEFAULT 'ativo'
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para materiais
CREATE POLICY "Usuários podem ver seus próprios materiais" 
  ON public.materiais 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios materiais" 
  ON public.materiais 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios materiais" 
  ON public.materiais 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios materiais" 
  ON public.materiais 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Política de admin para materiais
CREATE POLICY "Admin full access materiais" 
  ON public.materiais 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.perfis p 
    WHERE p.user_id = auth.uid() AND p.email = 'medtosdigital@gmail.com'
  ));

-- Migrar dados das tabelas existentes para a nova tabela materiais
-- Migrar planos de aula
INSERT INTO public.materiais (
    id, user_id, titulo, tipo_material, disciplina, serie, conteudo, template_usado,
    data_criacao, created_at, updated_at, periodo_inicio, periodo_fim, dias_semana,
    meses, semanas, avaliacoes, observacoes
)
SELECT 
    id, user_id, titulo, 'plano-de-aula', disciplina, serie, conteudo, template_usado,
    data_criacao, created_at, updated_at, periodo_inicio, periodo_fim, dias_semana,
    meses, semanas, avaliacoes, observacoes
FROM public.planos_de_aula;

-- Migrar atividades
INSERT INTO public.materiais (
    id, user_id, titulo, tipo_material, disciplina, serie, conteudo, template_usado,
    data_criacao, created_at, updated_at
)
SELECT 
    id, user_id, titulo, 'atividade', disciplina, serie, conteudo, template_usado,
    data_criacao, created_at, updated_at
FROM public.atividades;

-- Migrar slides
INSERT INTO public.materiais (
    id, user_id, titulo, tipo_material, disciplina, serie, conteudo, template_usado,
    data_criacao, created_at, updated_at
)
SELECT 
    id, user_id, titulo, 'slides', disciplina, serie, conteudo, template_usado,
    data_criacao, created_at, updated_at
FROM public.slides;

-- Migrar avaliações
INSERT INTO public.materiais (
    id, user_id, titulo, tipo_material, disciplina, serie, conteudo, template_usado,
    data_criacao, created_at, updated_at
)
SELECT 
    id, user_id, titulo, 'avaliacao', disciplina, serie, conteudo, template_usado,
    data_criacao, created_at, updated_at
FROM public.avaliacoes;

-- Migrar materiais de apoio
INSERT INTO public.materiais (
    id, user_id, titulo, tipo_material, disciplina, serie, conteudo, 
    data_criacao, created_at, material_principal_id, tema, turma, status
)
SELECT 
    id, user_id, COALESCE(titulo, tema), 'apoio', disciplina, turma, conteudo,
    created_at, created_at, material_principal_id, tema, turma, status
FROM public.materiais_apoio;

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_materiais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_materiais_updated_at
    BEFORE UPDATE ON public.materiais
    FOR EACH ROW EXECUTE FUNCTION public.handle_materiais_updated_at();

-- Remover tabelas antigas de materiais
DROP TABLE IF EXISTS public.planos_de_aula CASCADE;
DROP TABLE IF EXISTS public.atividades CASCADE;
DROP TABLE IF EXISTS public.slides CASCADE;
DROP TABLE IF EXISTS public.avaliacoes CASCADE;
DROP TABLE IF EXISTS public.materiais_apoio CASCADE;

-- Atualizar políticas RLS da tabela perfis para remover referências à tabela profiles
DROP POLICY IF EXISTS "Admin full access" ON public.perfis;
CREATE POLICY "Admin full access perfis" 
  ON public.perfis 
  FOR ALL 
  USING (email = 'medtosdigital@gmail.com');
