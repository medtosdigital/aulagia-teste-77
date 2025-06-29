
-- Habilitar RLS na tabela planos_usuarios se ainda não estiver habilitado
ALTER TABLE public.planos_usuarios ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela planos_usuarios
CREATE POLICY "Usuários podem ver seus próprios planos" 
  ON public.planos_usuarios 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios planos" 
  ON public.planos_usuarios 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios planos" 
  ON public.planos_usuarios 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Habilitar RLS na tabela uso_mensal_materiais se ainda não estiver habilitado
ALTER TABLE public.uso_mensal_materiais ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela uso_mensal_materiais
CREATE POLICY "Usuários podem ver seu próprio uso mensal" 
  ON public.uso_mensal_materiais 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio uso mensal" 
  ON public.uso_mensal_materiais 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio uso mensal" 
  ON public.uso_mensal_materiais 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu próprio uso mensal" 
  ON public.uso_mensal_materiais 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar tabela para eventos do calendário
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id TEXT,
  title TEXT NOT NULL,
  subject TEXT,
  grade TEXT,
  event_type TEXT NOT NULL DEFAULT 'single' CHECK (event_type IN ('single', 'multiple')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT,
  classroom TEXT,
  recurrence JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela calendar_events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela calendar_events
CREATE POLICY "Usuários podem ver seus próprios eventos" 
  ON public.calendar_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios eventos" 
  ON public.calendar_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios eventos" 
  ON public.calendar_events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios eventos" 
  ON public.calendar_events 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER handle_calendar_events_updated_at 
  BEFORE UPDATE ON public.calendar_events 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
