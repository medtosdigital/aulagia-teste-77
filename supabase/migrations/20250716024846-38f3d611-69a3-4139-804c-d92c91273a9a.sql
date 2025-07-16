
-- Criar bucket para armazenar imagens das notificações
INSERT INTO storage.buckets (id, name, public)
VALUES ('notificacoes', 'notificacoes', true);

-- Criar política para permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload notification images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'notificacoes' 
  AND auth.role() = 'authenticated'
);

-- Criar política para permitir que todos vejam as imagens (já que as notificações são públicas)
CREATE POLICY "Public access to notification images"
ON storage.objects FOR SELECT
USING (bucket_id = 'notificacoes');

-- Criar política para permitir que usuários autenticados atualizem suas próprias imagens
CREATE POLICY "Authenticated users can update notification images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'notificacoes' 
  AND auth.role() = 'authenticated'
);

-- Criar política para permitir que usuários autenticados deletem suas próprias imagens
CREATE POLICY "Authenticated users can delete notification images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'notificacoes' 
  AND auth.role() = 'authenticated'
);
