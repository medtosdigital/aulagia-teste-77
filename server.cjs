// server.js
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://<YOUR_SUPABASE_URL>'; // Substitua pelo seu valor real
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '<YOUR_SUPABASE_SERVICE_KEY>';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Controle de segurança do webhook (pode ser ativado/desativado via painel, aqui como variável)
let webhookSecurityEnabled = false;

// Endpoint para ativar/desativar segurança do webhook (pode ser protegido por autenticação se necessário)
app.post('/api/webhooks/aulagia/security', (req, res) => {
  const { enabled } = req.body;
  webhookSecurityEnabled = !!enabled;
  res.json({ success: true, enabled: webhookSecurityEnabled });
});

// Endpoint principal do webhook
app.post('/api/webhooks/aulagia', async (req, res) => {
  try {
    const { email, evento, produto, token } = req.body;
    if (!email || !evento || !produto) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }
    if (webhookSecurityEnabled && token !== 'q64w1ncxx2k') {
      return res.status(403).json({ error: 'Token inválido.' });
    }
    // Buscar usuário pelo email
    const { data: perfis, error: perfisError } = await supabase
      .from('perfis')
      .select('user_id, email')
      .eq('email', email);
    if (perfisError || !perfis || perfis.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    const userId = perfis[0].user_id;
    // Determinar novo plano
    let novoPlano = 'gratuito';
    let planoAplicado = 'gratuito';
    const eventoLower = evento.toLowerCase();
    const produtoLower = (produto || '').toLowerCase();
    if (eventoLower === 'assinatura renovada' || eventoLower === 'assinatura aprovada') {
      if (produtoLower.includes('professor') && produtoLower.includes('mensal')) {
        novoPlano = 'professor'; planoAplicado = 'Plano Professor (Mensal)';
      } else if (produtoLower.includes('professor') && produtoLower.includes('anual')) {
        novoPlano = 'professor'; planoAplicado = 'Plano Professor (Anual)';
      } else if (produtoLower.includes('grupo') && produtoLower.includes('mensal')) {
        novoPlano = 'grupo_escolar'; planoAplicado = 'Plano Grupo Escolar (Mensal)';
      } else if (produtoLower.includes('grupo') && produtoLower.includes('anual')) {
        novoPlano = 'grupo_escolar'; planoAplicado = 'Plano Grupo Escolar (Anual)';
      }
    }
    // Se evento for cancelamento, atraso, etc, volta para gratuito
    if ([
      'assinatura cancelada',
      'assinatura atrasada',
      'assinatura expirada',
      'assinatura suspensa',
      'assinatura perdida',
    ].includes(eventoLower)) {
      novoPlano = 'gratuito'; planoAplicado = 'gratuito';
    }
    // Atualizar plano do usuário
    const { error: updateError } = await supabase
      .from('perfis')
      .update({ plano_ativo: novoPlano })
      .eq('user_id', userId);
    if (updateError) {
      return res.status(500).json({ error: 'Erro ao atualizar plano do usuário.' });
    }
    // Registrar log
    await supabase.from('webhook_logs').insert({
      email,
      evento,
      plano_aplicado: planoAplicado,
    });
    return res.json({ success: true, plano_aplicado: planoAplicado });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.get('/api/export-pdf', async (req, res) => {
  const url = req.query.url;
  const filename = req.query.filename || 'material.pdf';
  if (!url) {
    return res.status(400).json({ error: 'Parâmetro ?url= obrigatório' });
  }
  const outputPath = path.join(__dirname, 'tmp_' + Date.now() + '.pdf');
  // Executa o script export-pdf.js
  exec(`node export-pdf.js "${url}" "${outputPath}"`, async (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
    // Envia o PDF para download
    res.download(outputPath, filename, (err) => {
      fs.unlink(outputPath, () => {}); // Remove o arquivo temporário
      if (err) {
        console.error('Erro ao enviar PDF:', err);
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de exportação PDF rodando em http://localhost:${PORT}`);
}); 