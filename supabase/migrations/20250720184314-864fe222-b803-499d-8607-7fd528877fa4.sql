
-- Aplicar RLS e políticas corrigidas para todas as tabelas

-- 1. MATERIAIS - Corrigir políticas existentes
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.materiais;
CREATE POLICY "Materiais: cada um vê o seu" ON public.materiais FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "Materiais: cada um edita o seu" ON public.materiais FOR UPDATE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "Materiais: cada um deleta o seu" ON public.materiais FOR DELETE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "Materiais: cada um insere o seu" ON public.materiais FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));

-- 2. CALENDAR_EVENTS - Corrigir políticas existentes
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.calendar_events;
-- Manter as políticas específicas já existentes, apenas adicionar acesso admin
CREATE POLICY "Admin: acesso total a eventos" ON public.calendar_events FOR ALL USING (EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));

-- 3. USER_ACTIVITIES - Corrigir políticas existentes
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.user_activities;
CREATE POLICY "UserActivities: cada um vê o seu" ON public.user_activities FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "UserActivities: cada um edita o seu" ON public.user_activities FOR UPDATE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "UserActivities: cada um deleta o seu" ON public.user_activities FOR DELETE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "UserActivities: cada um insere o seu" ON public.user_activities FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));

-- 4. FEEDBACKS - Corrigir políticas existentes
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.feedbacks;
CREATE POLICY "Feedbacks: cada um vê o seu" ON public.feedbacks FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "Feedbacks: cada um edita o seu" ON public.feedbacks FOR UPDATE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "Feedbacks: cada um deleta o seu" ON public.feedbacks FOR DELETE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "Feedbacks: cada um insere o seu" ON public.feedbacks FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));

-- 5. NOTIFICACOES - Corrigir políticas existentes
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.notificacoes;
CREATE POLICY "Notificacoes: todos podem ver (para notificações globais)" ON public.notificacoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Notificacoes: admin pode fazer tudo" ON public.notificacoes FOR ALL USING (EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));

-- 6. PERFIS - Manter políticas existentes específicas, apenas adicionar para outras operações
CREATE POLICY "Perfis: cada um edita o seu" ON public.perfis FOR UPDATE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis p WHERE p.user_id = auth.uid() AND p.plano_ativo = 'admin'));
CREATE POLICY "Perfis: cada um deleta o seu" ON public.perfis FOR DELETE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis p WHERE p.user_id = auth.uid() AND p.plano_ativo = 'admin'));
CREATE POLICY "Perfis: cada um insere o seu" ON public.perfis FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM perfis p WHERE p.user_id = auth.uid() AND p.plano_ativo = 'admin'));

-- 7. WEBHOOK_LOGS - Corrigir políticas existentes
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.webhook_logs;
-- Manter política de inserção do sistema
CREATE POLICY "WebhookLogs: admin pode ver tudo" ON public.webhook_logs FOR SELECT USING (EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "WebhookLogs: admin pode editar tudo" ON public.webhook_logs FOR UPDATE USING (EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));
CREATE POLICY "WebhookLogs: admin pode deletar tudo" ON public.webhook_logs FOR DELETE USING (EXISTS (SELECT 1 FROM perfis WHERE user_id = auth.uid() AND plano_ativo = 'admin'));

-- 8. GRUPOS_ESCOLARES - As políticas já estão corretas (owner-based)

-- 9. MEMBROS_GRUPO_ESCOLAR - As políticas já estão corretas (group owner + member based)

-- 10. INVITES - As políticas já estão corretas (email-based)

-- Criar função auxiliar para verificar se é admin (para melhor performance)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se é o email admin específico primeiro
    IF auth.email() = 'medtosdigital@gmail.com' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar plano na tabela perfis
    RETURN EXISTS (
        SELECT 1 FROM public.perfis 
        WHERE user_id = auth.uid() AND plano_ativo = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Atualizar políticas para usar a função (mais eficiente)
DROP POLICY IF EXISTS "Materiais: cada um vê o seu" ON public.materiais;
DROP POLICY IF EXISTS "Materiais: cada um edita o seu" ON public.materiais;
DROP POLICY IF EXISTS "Materiais: cada um deleta o seu" ON public.materiais;
DROP POLICY IF EXISTS "Materiais: cada um insere o seu" ON public.materiais;

CREATE POLICY "Materiais: acesso restrito por usuário ou admin" ON public.materiais FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "UserActivities: cada um vê o seu" ON public.user_activities;
DROP POLICY IF EXISTS "UserActivities: cada um edita o seu" ON public.user_activities;
DROP POLICY IF EXISTS "UserActivities: cada um deleta o seu" ON public.user_activities;
DROP POLICY IF EXISTS "UserActivities: cada um insere o seu" ON public.user_activities;

CREATE POLICY "UserActivities: acesso restrito por usuário ou admin" ON public.user_activities FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "Feedbacks: cada um vê o seu" ON public.feedbacks;
DROP POLICY IF EXISTS "Feedbacks: cada um edita o seu" ON public.feedbacks;
DROP POLICY IF EXISTS "Feedbacks: cada um deleta o seu" ON public.feedbacks;
DROP POLICY IF EXISTS "Feedbacks: cada um insere o seu" ON public.feedbacks;

CREATE POLICY "Feedbacks: acesso restrito por usuário ou admin" ON public.feedbacks FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "Perfis: cada um edita o seu" ON public.perfis;
DROP POLICY IF EXISTS "Perfis: cada um deleta o seu" ON public.perfis;
DROP POLICY IF EXISTS "Perfis: cada um insere o seu" ON public.perfis;

CREATE POLICY "Perfis: acesso restrito por usuário ou admin" ON public.perfis FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY "Perfis: delete restrito por usuário ou admin" ON public.perfis FOR DELETE USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY "Perfis: insert restrito por usuário ou admin" ON public.perfis FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "WebhookLogs: admin pode ver tudo" ON public.webhook_logs;
DROP POLICY IF EXISTS "WebhookLogs: admin pode editar tudo" ON public.webhook_logs;
DROP POLICY IF EXISTS "WebhookLogs: admin pode deletar tudo" ON public.webhook_logs;

CREATE POLICY "WebhookLogs: apenas admin tem acesso" ON public.webhook_logs FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Notificacoes: admin pode fazer tudo" ON public.notificacoes;
CREATE POLICY "Notificacoes: admin pode gerenciar" ON public.notificacoes FOR UPDATE USING (public.is_admin_user());
CREATE POLICY "Notificacoes: admin pode deletar" ON public.notificacoes FOR DELETE USING (public.is_admin_user());
CREATE POLICY "Notificacoes: admin pode inserir" ON public.notificacoes FOR INSERT WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Admin: acesso total a eventos" ON public.calendar_events;
CREATE POLICY "CalendarEvents: admin tem acesso total" ON public.calendar_events FOR ALL USING (public.is_admin_user());
