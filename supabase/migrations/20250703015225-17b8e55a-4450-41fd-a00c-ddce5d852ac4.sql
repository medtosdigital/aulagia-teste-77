-- Criar tabela para gerenciar grupos escolares
CREATE TABLE public.grupos_escolares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_grupo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(owner_id)
);

-- Habilitar RLS
ALTER TABLE public.grupos_escolares ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para grupos escolares
CREATE POLICY "Owners can view their own groups" 
    ON public.grupos_escolares 
    FOR SELECT 
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own groups" 
    ON public.grupos_escolares 
    FOR UPDATE 
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create their own groups" 
    ON public.grupos_escolares 
    FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own groups" 
    ON public.grupos_escolares 
    FOR DELETE 
    USING (auth.uid() = owner_id);

-- Criar tabela para membros do grupo escolar
CREATE TABLE public.membros_grupo_escolar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grupo_id UUID NOT NULL REFERENCES public.grupos_escolares(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    limite_materiais INTEGER NOT NULL DEFAULT 60, -- Limite padrão (300/5)
    status TEXT NOT NULL DEFAULT 'ativo', -- ativo, pendente, inativo
    convite_enviado_em TIMESTAMP WITH TIME ZONE,
    aceito_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(grupo_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.membros_grupo_escolar ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para membros
CREATE POLICY "Group owners can manage members" 
    ON public.membros_grupo_escolar 
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.grupos_escolares 
            WHERE id = grupo_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Members can view their own membership" 
    ON public.membros_grupo_escolar 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Função para validar limites do grupo
CREATE OR REPLACE FUNCTION public.validate_group_limits()
RETURNS TRIGGER AS $$
DECLARE
    total_limite INTEGER;
BEGIN
    -- Calcular total de limites do grupo
    SELECT COALESCE(SUM(limite_materiais), 0) INTO total_limite
    FROM public.membros_grupo_escolar
    WHERE grupo_id = NEW.grupo_id;
    
    -- Verificar se o total não excede 300
    IF total_limite > 300 THEN
        RAISE EXCEPTION 'O total de limites do grupo não pode exceder 300 materiais';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar limites
CREATE TRIGGER validate_group_limits_trigger
    BEFORE INSERT OR UPDATE ON public.membros_grupo_escolar
    FOR EACH ROW EXECUTE FUNCTION public.validate_group_limits();

-- Função para obter limite de material considerando grupo escolar
CREATE OR REPLACE FUNCTION public.get_user_material_limit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_plan tipo_plano;
    group_limit INTEGER;
    plan_limit INTEGER;
BEGIN
    -- Obter plano do usuário
    SELECT plano_ativo INTO user_plan
    FROM public.planos_usuarios
    WHERE user_id = p_user_id;
    
    -- Se for grupo escolar, retornar 300 (limite total)
    IF user_plan = 'grupo_escolar' THEN
        RETURN 300;
    END IF;
    
    -- Verificar se é membro de um grupo escolar
    SELECT limite_materiais INTO group_limit
    FROM public.membros_grupo_escolar
    WHERE user_id = p_user_id AND status = 'ativo';
    
    -- Se for membro de grupo, retornar limite do grupo
    IF group_limit IS NOT NULL THEN
        RETURN group_limit;
    END IF;
    
    -- Senão, retornar limite padrão do plano
    SELECT public.get_plan_limits(user_plan) INTO plan_limit;
    RETURN COALESCE(plan_limit, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar função can_create_material para considerar grupos
CREATE OR REPLACE FUNCTION public.can_create_material(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_limit INTEGER;
    current_usage INTEGER;
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    current_month INTEGER := EXTRACT(MONTH FROM NOW());
BEGIN
    -- Obter limite do usuário (considerando grupos)
    SELECT public.get_user_material_limit(p_user_id) INTO user_limit;
    
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
    RETURN current_usage < user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_grupos_escolares_updated_at
    BEFORE UPDATE ON public.grupos_escolares
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_membros_grupo_updated_at
    BEFORE UPDATE ON public.membros_grupo_escolar
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();