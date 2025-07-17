
-- Habilitar RLS para a tabela feedbacks
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela feedbacks
CREATE POLICY "Usuários podem ver seus próprios feedbacks" 
  ON public.feedbacks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios feedbacks" 
  ON public.feedbacks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios feedbacks" 
  ON public.feedbacks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios feedbacks" 
  ON public.feedbacks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Habilitar RLS para a tabela materiais_apoio
ALTER TABLE public.materiais_apoio ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela materiais_apoio
CREATE POLICY "Usuários podem ver seus próprios materiais de apoio" 
  ON public.materiais_apoio 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios materiais de apoio" 
  ON public.materiais_apoio 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios materiais de apoio" 
  ON public.materiais_apoio 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios materiais de apoio" 
  ON public.materiais_apoio 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Habilitar RLS para a tabela notificacoes
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela notificacoes
-- Política para administrador criar notificações
CREATE POLICY "Administradores podem gerenciar todas as notificações" 
  ON public.notificacoes 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM planos_usuarios
    WHERE user_id = auth.uid() AND plano_ativo = 'admin'
  ));

-- Política para usuários verem notificações (todas são públicas para usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver notificações" 
  ON public.notificacoes 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at nas tabelas
CREATE OR REPLACE FUNCTION public.update_notificacao_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notificacao_timestamp
BEFORE UPDATE ON public.notificacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_notificacao_updated_at();
