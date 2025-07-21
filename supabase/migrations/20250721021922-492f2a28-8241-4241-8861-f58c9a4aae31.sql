
-- Atualizar a coluna billing_type para usar valores em português
UPDATE public.perfis 
SET billing_type = CASE 
    WHEN billing_type = 'monthly' THEN 'mensal'
    WHEN billing_type = 'yearly' THEN 'anual'
    ELSE billing_type
END;

-- Alterar o tipo da coluna para aceitar apenas valores em português
ALTER TABLE public.perfis 
ALTER COLUMN billing_type TYPE text;

-- Adicionar constraint para garantir apenas valores válidos em português
ALTER TABLE public.perfis 
ADD CONSTRAINT billing_type_check 
CHECK (billing_type IN ('mensal', 'anual'));

-- Atualizar usuários com plano grupo_escolar para anual (se estiverem como mensal)
UPDATE public.perfis 
SET billing_type = 'anual' 
WHERE plano_ativo = 'grupo_escolar' 
AND billing_type = 'mensal';
