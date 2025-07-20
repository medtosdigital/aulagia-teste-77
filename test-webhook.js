async function testWebhook() {
  try {
    console.log('🧪 Testando webhook com usuário existente...');
    
    const response = await fetch('https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/webhooks-aulagia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'arthurcrasto9@gmail.com',
        evento: 'compra aprovada',
        produto: 'Plano Professor (Mensal)',
        token: 'q64w1ncxx2k'
      })
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Webhook funcionou corretamente!');
    } else {
      console.log('❌ Webhook falhou:', result);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testWebhook(); 