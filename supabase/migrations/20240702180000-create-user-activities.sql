-- Criação da tabela de histórico de atividades do usuário
create table if not exists user_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  description text not null,
  material_type text,
  material_id text,
  subject text,
  grade text,
  created_at timestamptz not null default now()
);

-- Índice para buscas rápidas por usuário e data
grant select, insert, update, delete on user_activities to anon, authenticated;
create index if not exists idx_user_activities_user_id_created_at
  on user_activities (user_id, created_at desc); 