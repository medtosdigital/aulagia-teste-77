import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunctionAccess() {
  try {
    console.log('🧪 Testando acesso à Edge Function...');
    
    const webhookUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/webhooks-aulagia';
    
    // Teste 1: Sem headers de autorização
    console.log('📋 Teste 1: Sem headers de autorização');
    try {
      const response1 = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'teste@exemplo.com',
          evento: 'teste_acesso',
          produto: 'Plano Professor (Mensal)',
          token: 'q64w1ncxx2k'
        })
      });
      
      console.log('Status:', response1.status);
      const result1 = await response1.json();
      console.log('Resposta:', result1);
      
      if (response1.ok) {
        console.log('✅ Edge Function acessível sem autenticação');
      } else {
        console.log('❌ Edge Function não acessível sem autenticação');
      }
    } catch (error) {
      console.error('❌ Erro no teste 1:', error.message);
    }
    
    // Teste 2: Com headers de autorização
    console.log('\n📋 Teste 2: Com headers de autorização');
    try {
      const response2 = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          email: 'teste@exemplo.com',
          evento: 'teste_acesso',
          produto: 'Plano Professor (Mensal)',
          token: 'q64w1ncxx2k'
        })
      });
      
      console.log('Status:', response2.status);
      const result2 = await response2.json();
      console.log('Resposta:', result2);
      
      if (response2.ok) {
        console.log('✅ Edge Function acessível com autenticação');
      } else {
        console.log('❌ Edge Function não acessível com autenticação');
      }
    } catch (error) {
      console.error('❌ Erro no teste 2:', error.message);
    }
    
    console.log('\n🎉 Testes concluídos!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testEdgeFunctionAccess(); 