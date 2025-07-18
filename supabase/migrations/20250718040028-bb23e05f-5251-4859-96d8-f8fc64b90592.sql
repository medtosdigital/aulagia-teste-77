
-- Primeiro, vamos adicionar as colunas necessárias à tabela perfis
ALTER TABLE public.perfis 
ADD COLUMN plano_ativo tipo_plano DEFAULT 'gratuito'::tipo_plano,
ADD COLUMN data_inicio_plano timestamp with time zone DEFAULT now(),
ADD COLUMN data_expiracao_plano timestamp with time zone,
ADD COLUMN materiais_criados_mes_atual integer DEFAULT 0,
ADD COLUMN ano_atual integer DEFAULT EXTRACT(YEAR FROM NOW()),
ADD COLUMN mes_atual integer DEFAULT EXTRACT(MONTH FROM NOW()),
ADD COLUMN ultimo_reset_materiais timestamp with time zone DEFAULT date_trunc('month', now());

-- Migrar dados da tabela planos_usuarios para perfis
UPDATE public.perfis 
SET 
    plano_ativo = p.plano_ativo,
    data_inicio_plano = p.data_inicio,
    data_expiracao_plano = p.data_expiracao
FROM public.planos_usuarios p 
WHERE perfis.user_id = p.user_id;

-- Migrar dados da tabela uso_mensal_materiais para perfis (apenas o mês atual)
UPDATE public.perfis 
SET 
    materiais_criados_mes_atual = u.materiais_criados,
    ano_atual = u.ano,
    mes_atual = u.mes
FROM public.uso_mensal_materiais u 
WHERE perfis.user_id = u.user_id 
AND u.ano = EXTRACT(YEAR FROM NOW()) 
AND u.mes = EXTRACT(MONTH FROM NOW());

-- Atualizar as funções existentes para usar a tabela perfis
CREATE OR REPLACE FUNCTION public.get_user_material_limit(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_plan tipo_plano;
    group_limit INTEGER;
    plan_limit INTEGER;
BEGIN
    -- Obter plano do usuário da tabela perfis
    SELECT plano_ativo INTO user_plan
    FROM public.perfis
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
    RETURN COALESCE(plan_limit, 5);
END;
$$;

CREATE OR REPLACE FUNCTION public.can_create_material(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_limit INTEGER;
    current_usage INTEGER;
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    current_month INTEGER := EXTRACT(MONTH FROM NOW());
    perfil_record RECORD;
BEGIN
    -- Obter dados do perfil
    SELECT * INTO perfil_record
    FROM public.perfis
    WHERE user_id = p_user_id;
    
    -- Se não encontrou perfil, não pode criar
    IF perfil_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se precisa resetar o contador mensal
    IF perfil_record.ano_atual != current_year OR perfil_record.mes_atual != current_month THEN
        -- Reset do contador mensal
        UPDATE public.perfis 
        SET 
            materiais_criados_mes_atual = 0,
            ano_atual = current_year,
            mes_atual = current_month,
            ultimo_reset_materiais = NOW()
        WHERE user_id = p_user_id;
        
        current_usage := 0;
    ELSE
        current_usage := COALESCE(perfil_record.materiais_criados_mes_atual, 0);
    END IF;
    
    -- Obter limite do usuário
    SELECT public.get_user_material_limit(p_user_id) INTO user_limit;
    
    -- Verificar se ainda pode criar
    RETURN current_usage < user_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_material_usage(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    current_month INTEGER := EXTRACT(MONTH FROM NOW());
BEGIN
    -- Verificar se precisa resetar o contador primeiro
    UPDATE public.perfis 
    SET 
        materiais_criados_mes_atual = CASE 
            WHEN ano_atual != current_year OR mes_atual != current_month THEN 1
            ELSE materiais_criados_mes_atual + 1
        END,
        ano_atual = current_year,
        mes_atual = current_month,
        ultimo_reset_materiais = CASE 
            WHEN ano_atual != current_year OR mes_atual != current_month THEN NOW()
            ELSE ultimo_reset_materiais
        END
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$;

-- Função para atualizar plano do usuário
CREATE OR REPLACE FUNCTION public.update_user_plan(p_user_id uuid, p_new_plan tipo_plano, p_expiration_date timestamp with time zone DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.perfis
    SET 
        plano_ativo = p_new_plan,
        data_inicio_plano = NOW(),
        data_expiracao_plano = p_expiration_date,
        -- Reset do contador de materiais ao trocar de plano
        materiais_criados_mes_atual = 0,
        ultimo_reset_materiais = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN FOUND;
END;
$$;

-- Função para obter materiais restantes
CREATE OR REPLACE FUNCTION public.get_remaining_materials(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_limit INTEGER;
    current_usage INTEGER;
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    current_month INTEGER := EXTRACT(MONTH FROM NOW());
    perfil_record RECORD;
BEGIN
    -- Obter dados do perfil
    SELECT * INTO perfil_record
    FROM public.perfis
    WHERE user_id = p_user_id;
    
    -- Se não encontrou perfil, retornar 0
    IF perfil_record IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Verificar se precisa resetar o contador mensal
    IF perfil_record.ano_atual != current_year OR perfil_record.mes_atual != current_month THEN
        current_usage := 0;
    ELSE
        current_usage := COALESCE(perfil_record.materiais_criados_mes_atual, 0);
    END IF;
    
    -- Obter limite do usuário
    SELECT public.get_user_material_limit(p_user_id) INTO user_limit;
    
    -- Retornar materiais restantes
    RETURN GREATEST(0, user_limit - current_usage);
END;
$$;

-- Atualizar trigger para handle_new_user_plan para usar perfis
DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_plan();

-- Criar novo trigger que usa a tabela perfis
CREATE OR REPLACE FUNCTION public.handle_new_user_profile_complete()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir ou atualizar perfil completo
    INSERT INTO public.perfis (
        user_id, 
        email, 
        full_name,
        plano_ativo,
        data_inicio_plano,
        materiais_criados_mes_atual,
        ano_atual,
        mes_atual,
        ultimo_reset_materiais
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'gratuito'::tipo_plano,
        NOW(),
        0,
        EXTRACT(YEAR FROM NOW()),
        EXTRACT(MONTH FROM NOW()),
        date_trunc('month', now())
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, perfis.full_name),
        plano_ativo = COALESCE(perfis.plano_ativo, 'gratuito'::tipo_plano),
        data_inicio_plano = COALESCE(perfis.data_inicio_plano, NOW()),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_profile_complete
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile_complete();

-- Remover as tabelas antigas (após confirmar que tudo está funcionando)
-- DROP TABLE IF EXISTS public.planos_usuarios CASCADE;
-- DROP TABLE IF EXISTS public.uso_mensal_materiais CASCADE;

-- Por segurança, vamos comentar as drops por enquanto e deixar como comentário
-- As tabelas podem ser removidas depois de testar se tudo está funcionando
