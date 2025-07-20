-- Criar tabela de planos
CREATE TABLE IF NOT EXISTS planos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT,
  preco_mensal DECIMAL(10,2) NOT NULL,
  preco_anual DECIMAL(10,2) NOT NULL,
  limite_materiais_mensal INTEGER NOT NULL,
  pode_download_word BOOLEAN DEFAULT false,
  pode_download_ppt BOOLEAN DEFAULT false,
  pode_editar_materiais BOOLEAN DEFAULT false,
  pode_criar_slides BOOLEAN DEFAULT false,
  pode_criar_avaliacoes BOOLEAN DEFAULT false,
  tem_calendario BOOLEAN DEFAULT false,
  tem_historico BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO planos (nome, descricao, preco_mensal, preco_anual, limite_materiais_mensal, pode_download_word, pode_download_ppt, pode_editar_materiais, pode_criar_slides, pode_criar_avaliacoes, tem_calendario, tem_historico) VALUES
('gratuito', 'Plano gratuito com recursos básicos', 0.00, 0.00, 5, false, false, false, false, false, false, false),
('professor', 'Plano para professores individuais', 29.90, 299.00, 50, true, true, true, true, true, true, true),
('grupo_escolar', 'Plano para grupos escolares', 89.90, 849.00, 300, true, true, true, true, true, true, true),
('admin', 'Plano administrativo', 0.00, 0.00, 999999, true, true, true, true, true, true, true);

-- Adicionar colunas necessárias na tabela perfis
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS status_plano VARCHAR(20) DEFAULT 'ativo' CHECK (status_plano IN ('ativo', 'atrasado', 'cancelado')),
ADD COLUMN IF NOT EXISTS ultima_renovacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_perfis_status_plano ON perfis(status_plano);
CREATE INDEX IF NOT EXISTS idx_perfis_data_expiracao ON perfis(data_expiracao_plano);
CREATE INDEX IF NOT EXISTS idx_perfis_plano_ativo ON perfis(plano_ativo); 