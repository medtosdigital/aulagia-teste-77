-- Ativar Row Level Security
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT apenas para o próprio usuário
do $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Usuário pode ver apenas suas atividades' AND tablename = 'user_activities'
  ) THEN
    CREATE POLICY "Usuário pode ver apenas suas atividades"
      ON user_activities
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Permitir INSERT apenas para o próprio usuário
do $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Usuário pode inserir apenas suas atividades' AND tablename = 'user_activities'
  ) THEN
    CREATE POLICY "Usuário pode inserir apenas suas atividades"
      ON user_activities
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Permitir UPDATE apenas para o próprio usuário (opcional)
do $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Usuário pode atualizar apenas suas atividades' AND tablename = 'user_activities'
  ) THEN
    CREATE POLICY "Usuário pode atualizar apenas suas atividades"
      ON user_activities
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Permitir DELETE apenas para o próprio usuário
do $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Usuário pode deletar apenas suas atividades' AND tablename = 'user_activities'
  ) THEN
    CREATE POLICY "Usuário pode deletar apenas suas atividades"
      ON user_activities
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$; 