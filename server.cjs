// server.js
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

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