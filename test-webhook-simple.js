import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebhookSimple() {
  try {
    console.log('🧪 Teste simples do webhook...');
    
    // 1. Verificar se a tabela perfis existe
    console.log('📋 Verificando tabela perfis...');
    const { data: perfisTest, error: perfisError } = await supabase
      .from('perfis')
      .select('count')
      .limit(1);
    
    console.log('✅ Tabela perfis acessível:', perfisTest);
    
    // 2. Verificar se a tabela webhook_logs existe
    console.log('📋 Verificando tabela webhook_logs...');
    const { data: logsTest, error: logsError } = await supabase
      .from('webhook_logs')
      .select('count')
      .limit(1);
    
    console.log('✅ Tabela webhook_logs acessível:', logsTest);
    
    // 3. Testar a Edge Function com dados mínimos
    console.log('🔧 Testando Edge Function...');
    const { data, error } = await supabase.functions.invoke('webhooks-aulagia', {
      body: {
        email: 'teste@exemplo.com',
        evento: 'compra aprovada',
        produto: 'Plano Professor (Mensal)'
      }
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      console.error('📋 Detalhes do erro:', error.message);
      return;
    }
    
    console.log('✅ Resposta da Edge Function:', data);
    
    // 4. Verificar logs
    console.log('📝 Verificando logs...');
    const { data: logs, error: logsError2 } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (logsError2) {
      console.error('❌ Erro ao buscar logs:', logsError2);
    } else {
      console.log('📝 Logs recentes:', logs);
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testWebhookSimple(); 