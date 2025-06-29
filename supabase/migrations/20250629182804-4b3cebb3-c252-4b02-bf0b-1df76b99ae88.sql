
-- Criar tabela para planos de aula
CREATE TABLE public.planos_de_aula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo_material TEXT NOT NULL DEFAULT 'plano-de-aula',
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  template_usado TEXT,
  disciplina TEXT,
  serie TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para atividades
CREATE TABLE public.atividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo_material TEXT NOT NULL DEFAULT 'atividade',
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  template_usado TEXT,
  disciplina TEXT,
  serie TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para slides
CREATE TABLE public.slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo_material TEXT NOT NULL DEFAULT 'slides',
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  template_usado TEXT,
  disciplina TEXT,
  serie TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para avaliações
CREATE TABLE public.avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo_material TEXT NOT NULL DEFAULT 'avaliacao',
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  template_usado TEXT,
  disciplina TEXT,
  serie TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.planos_de_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para planos_de_aula
CREATE POLICY "Users can view their own planos_de_aula" 
  ON public.planos_de_aula 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own planos_de_aula" 
  ON public.planos_de_aula 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planos_de_aula" 
  ON public.planos_de_aula 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planos_de_aula" 
  ON public.planos_de_aula 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para atividades
CREATE POLICY "Users can view their own atividades" 
  ON public.atividades 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own atividades" 
  ON public.atividades 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own atividades" 
  ON public.atividades 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own atividades" 
  ON public.atividades 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para slides
CREATE POLICY "Users can view their own slides" 
  ON public.slides 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own slides" 
  ON public.slides 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slides" 
  ON public.slides 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slides" 
  ON public.slides 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para avaliacoes
CREATE POLICY "Users can view their own avaliacoes" 
  ON public.avaliacoes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own avaliacoes" 
  ON public.avaliacoes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avaliacoes" 
  ON public.avaliacoes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avaliacoes" 
  ON public.avaliacoes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_planos_de_aula_updated_at
  BEFORE UPDATE ON public.planos_de_aula
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_atividades_updated_at
  BEFORE UPDATE ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_slides_updated_at
  BEFORE UPDATE ON public.slides
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
