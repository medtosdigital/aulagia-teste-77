-- Criar enum para tipos de planos
CREATE TYPE public.tipo_plano AS ENUM ('gratuito', 'professor', 'grupo_escolar');

-- Criar tabela de planos de usuários
CREATE TABLE public.planos_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plano_ativo tipo_plano NOT NULL DEFAULT 'gratuito',
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_expiracao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Habilitar RLS na tabela
ALTER TABLE public.planos_usuarios ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios planos
CREATE POLICY "Users can view their own plans" 
    ON public.planos_usuarios 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política para usuários atualizarem apenas seus próprios planos
CREATE POLICY "Users can update their own plans" 
    ON public.planos_usuarios 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Função para criar plano gratuito automaticamente para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_plan()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.planos_usuarios (user_id, plano_ativo)
    VALUES (NEW.id, 'gratuito');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created_plan
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_plan();

-- Criar tabela para controlar uso mensal de materiais
CREATE TABLE public.uso_mensal_materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    materiais_criados INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, ano, mes)
);

-- Habilitar RLS na tabela de uso mensal
ALTER TABLE public.uso_mensal_materiais ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio uso
CREATE POLICY "Users can view their own usage" 
    ON public.uso_mensal_materiais 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política para usuários atualizarem apenas seu próprio uso
CREATE POLICY "Users can update their own usage" 
    ON public.uso_mensal_materiais 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Função para obter limites do plano
CREATE OR REPLACE FUNCTION public.get_plan_limits(plan_type tipo_plano)
RETURNS INTEGER AS $$
BEGIN
    CASE plan_type
        WHEN 'gratuito' THEN RETURN 5;
        WHEN 'professor' THEN RETURN 50;
        WHEN 'grupo_escolar' THEN RETURN 300;
        ELSE RETURN 0;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para verificar se usuário pode criar material
CREATE OR REPLACE FUNCTION public.can_create_material(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_plan tipo_plano;
    plan_limit INTEGER;
    current_usage INTEGER;
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    current_month INTEGER := EXTRACT(MONTH FROM NOW());
BEGIN
    -- Obter plano atual do usuário
    SELECT plano_ativo INTO current_plan
    FROM public.planos_usuarios
    WHERE user_id = p_user_id;
    
    -- Se não encontrou plano, retorna false
    IF current_plan IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Obter limite do plano
    SELECT public.get_plan_limits(current_plan) INTO plan_limit;
    
    -- Obter uso atual do mês
    SELECT COALESCE(materiais_criados, 0) INTO current_usage
    FROM public.uso_mensal_materiais
    WHERE user_id = p_user_id 
    AND ano = current_year 
    AND mes = current_month;
    
    -- Se não há registro de uso, considerar 0
    IF current_usage IS NULL THEN
        current_usage := 0;
    END IF;
    
    -- Verificar se ainda pode criar
    RETURN current_usage < plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar uso de materiais
CREATE OR REPLACE FUNCTION public.increment_material_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    current_month INTEGER := EXTRACT(MONTH FROM NOW());
BEGIN
    -- Inserir ou atualizar uso mensal
    INSERT INTO public.uso_mensal_materiais (user_id, ano, mes, materiais_criados)
    VALUES (p_user_id, current_year, current_month, 1)
    ON CONFLICT (user_id, ano, mes)
    DO UPDATE SET 
        materiais_criados = uso_mensal_materiais.materiais_criados + 1,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_planos_usuarios_updated_at
    BEFORE UPDATE ON public.planos_usuarios
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_uso_mensal_updated_at
    BEFORE UPDATE ON public.uso_mensal_materiais
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
