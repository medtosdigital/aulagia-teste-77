
-- Adicionar coluna para referenciar o plano na tabela perfis
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS plano_id INTEGER REFERENCES public.planos(id);

-- Atualizar os registros existentes para vincular aos planos corretos
UPDATE public.perfis 
SET plano_id = CASE 
    WHEN plano_ativo = 'gratuito' THEN (SELECT id FROM public.planos WHERE nome = 'gratuito')
    WHEN plano_ativo = 'professor' THEN (SELECT id FROM public.planos WHERE nome = 'professor')
    WHEN plano_ativo = 'grupo_escolar' THEN (SELECT id FROM public.planos WHERE nome = 'grupo_escolar')
    WHEN plano_ativo = 'admin' THEN (SELECT id FROM public.planos WHERE nome = 'admin')
    ELSE (SELECT id FROM public.planos WHERE nome = 'gratuito')
END
WHERE plano_id IS NULL;

-- Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_perfis_plano_id ON public.perfis(plano_id);

-- Criar função para obter detalhes do plano com base no perfil do usuário
CREATE OR REPLACE FUNCTION public.get_user_plan_details(p_user_id uuid)
RETURNS TABLE (
    plano_nome text,
    plano_descricao text,
    preco_mensal numeric,
    preco_anual numeric,
    limite_materiais_mensal integer,
    pode_download_word boolean,
    pode_download_ppt boolean,
    pode_editar_materiais boolean,
    pode_criar_slides boolean,
    pode_criar_avaliacoes boolean,
    tem_calendario boolean,
    tem_historico boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.nome,
        p.descricao,
        p.preco_mensal,
        p.preco_anual,
        p.limite_materiais_mensal,
        p.pode_download_word,
        p.pode_download_ppt,
        p.pode_editar_materiais,
        p.pode_criar_slides,
        p.pode_criar_avaliacoes,
        p.tem_calendario,
        p.tem_historico
    FROM public.perfis pf
    JOIN public.planos p ON pf.plano_id = p.id
    WHERE pf.user_id = p_user_id;
END;
$$;

-- Criar função para atualizar plano do usuário usando a tabela planos
CREATE OR REPLACE FUNCTION public.update_user_plan_with_planos(p_user_id uuid, p_plano_nome text, p_expiration_date timestamp with time zone DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    plano_record RECORD;
    new_plano_id INTEGER;
BEGIN
    -- Buscar o plano na tabela planos
    SELECT id, nome INTO plano_record FROM public.planos WHERE nome = p_plano_nome AND ativo = true;
    
    IF plano_record IS NULL THEN
        RAISE EXCEPTION 'Plano % não encontrado ou não está ativo', p_plano_nome;
    END IF;
    
    new_plano_id := plano_record.id;
    
    -- Atualizar o perfil do usuário
    UPDATE public.perfis
    SET 
        plano_id = new_plano_id,
        plano_ativo = p_plano_nome::tipo_plano,
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

-- Criar trigger para manter consistência entre plano_ativo e plano_id
CREATE OR REPLACE FUNCTION public.sync_plano_ativo_with_plano_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Se plano_id mudou, atualizar plano_ativo
    IF OLD.plano_id IS DISTINCT FROM NEW.plano_id THEN
        SELECT nome INTO NEW.plano_ativo FROM public.planos WHERE id = NEW.plano_id;
    END IF;
    
    -- Se plano_ativo mudou, atualizar plano_id
    IF OLD.plano_ativo IS DISTINCT FROM NEW.plano_ativo THEN
        SELECT id INTO NEW.plano_id FROM public.planos WHERE nome = NEW.plano_ativo::text;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função
DROP TRIGGER IF EXISTS sync_plano_fields ON public.perfis;
CREATE TRIGGER sync_plano_fields
    BEFORE UPDATE ON public.perfis
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_plano_ativo_with_plano_id();
