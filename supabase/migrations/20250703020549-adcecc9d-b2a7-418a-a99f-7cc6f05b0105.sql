
-- Função para garantir que o proprietário do grupo seja sempre um membro ativo
CREATE OR REPLACE FUNCTION public.ensure_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando um grupo é criado, adicionar o proprietário como membro automaticamente
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.membros_grupo_escolar (grupo_id, user_id, limite_materiais, status, aceito_em)
        VALUES (NEW.id, NEW.owner_id, 60, 'ativo', NOW())
        ON CONFLICT (grupo_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para automaticamente adicionar o proprietário como membro
DROP TRIGGER IF EXISTS ensure_owner_membership ON public.grupos_escolares;
CREATE TRIGGER ensure_owner_membership
    AFTER INSERT ON public.grupos_escolares
    FOR EACH ROW EXECUTE FUNCTION public.ensure_owner_as_member();

-- Adicionar proprietários existentes como membros (para grupos já criados)
INSERT INTO public.membros_grupo_escolar (grupo_id, user_id, limite_materiais, status, aceito_em)
SELECT g.id, g.owner_id, 60, 'ativo', NOW()
FROM public.grupos_escolares g
WHERE NOT EXISTS (
    SELECT 1 FROM public.membros_grupo_escolar m 
    WHERE m.grupo_id = g.id AND m.user_id = g.owner_id
)
ON CONFLICT (grupo_id, user_id) DO NOTHING;
