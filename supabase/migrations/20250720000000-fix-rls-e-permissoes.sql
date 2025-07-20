-- Ativar RLS e corrigir políticas para tabelas sensíveis

-- 1. MATERIAIS
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Materiais: cada um vê o seu" ON public.materiais;
DROP POLICY IF EXISTS "Materiais: cada um edita o seu" ON public.materiais;
DROP POLICY IF EXISTS "Materiais: cada um deleta o seu" ON public.materiais;
DROP POLICY IF EXISTS "Materiais: cada um insere o seu" ON public.materiais;
CREATE POLICY "Materiais: cada um vê o seu" ON public.materiais FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Materiais: cada um edita o seu" ON public.materiais FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Materiais: cada um deleta o seu" ON public.materiais FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Materiais: cada um insere o seu" ON public.materiais FOR INSERT WITH CHECK (user_id = auth.uid());

-- 2. CALENDAR_EVENTS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eventos: cada um vê o seu" ON public.calendar_events;
DROP POLICY IF EXISTS "Eventos: cada um edita o seu" ON public.calendar_events;
DROP POLICY IF EXISTS "Eventos: cada um deleta o seu" ON public.calendar_events;
DROP POLICY IF EXISTS "Eventos: cada um insere o seu" ON public.calendar_events;
CREATE POLICY "Eventos: cada um vê o seu" ON public.calendar_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Eventos: cada um edita o seu" ON public.calendar_events FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Eventos: cada um deleta o seu" ON public.calendar_events FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Eventos: cada um insere o seu" ON public.calendar_events FOR INSERT WITH CHECK (user_id = auth.uid());

-- 3. USER_ACTIVITIES
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "UserActivities: cada um vê o seu" ON public.user_activities;
CREATE POLICY "UserActivities: cada um vê o seu" ON public.user_activities FOR SELECT USING (user_id = auth.uid());

-- 4. FEEDBACKS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Feedbacks: cada um vê o seu" ON public.feedbacks;
CREATE POLICY "Feedbacks: cada um vê o seu" ON public.feedbacks FOR SELECT USING (user_id = auth.uid());

-- 5. NOTIFICACOES
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notificacoes: cada um vê o seu" ON public.notificacoes;
CREATE POLICY "Notificacoes: cada um vê o seu" ON public.notificacoes FOR SELECT USING (user_id = auth.uid());

-- 6. PERFIS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Perfis: cada um vê o seu" ON public.perfis;
CREATE POLICY "Perfis: cada um vê o seu" ON public.perfis FOR SELECT USING (user_id = auth.uid());

-- 7. PLANOS_USUARIOS
ALTER TABLE public.planos_usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "PlanosUsuarios: cada um vê o seu" ON public.planos_usuarios;
CREATE POLICY "PlanosUsuarios: cada um vê o seu" ON public.planos_usuarios FOR SELECT USING (user_id = auth.uid());

-- 8. MEMBROS_GRUPO_ESCOLAR
ALTER TABLE public.membros_grupo_escolar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "MembrosGrupo: cada um vê o seu" ON public.membros_grupo_escolar;
CREATE POLICY "MembrosGrupo: cada um vê o seu" ON public.membros_grupo_escolar FOR SELECT USING (user_id = auth.uid());

-- 9. Permitir acesso a membros do mesmo grupo escolar (exemplo)
-- Ajuste conforme sua lógica de grupos
-- Exemplo: permitir que membros do mesmo grupo vejam materiais do grupo
--
-- CREATE POLICY "Materiais: membros do grupo escolar podem ver" ON public.materiais
--   FOR SELECT USING (
--     user_id = auth.uid() OR
--     EXISTS (
--       SELECT 1 FROM membros_grupo_escolar m
--       WHERE m.user_id = auth.uid() AND m.grupo_id = materiais.grupo_id
--     )
--   );

-- Repita lógica acima para outras tabelas se necessário 