import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebhookDirect() {
  try {
    console.log('🧪 Testando webhook diretamente via Supabase...');
    
    // Verificar se a tabela perfis existe e tem dados
    const { data: perfisUsers, error: perfisError } = await supabase
      .from('perfis')
      .select('*')
      .limit(5);
    
    console.log('📋 Usuários na tabela perfis:', perfisUsers);
    
    // Verificar se a tabela profiles existe e tem dados
    const { data: profilesUsers, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    console.log('📋 Usuários na tabela profiles:', profilesUsers);
    
    // Verificar se a tabela auth.users existe (apenas leitura)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    console.log('📋 Usuários na tabela auth.users:', authUsers);
    
    // Verificar se a tabela planos_usuarios existe
    const { data: planosUsers, error: planosError } = await supabase
      .from('planos_usuarios')
      .select('*')
      .limit(5);
    
    console.log('📋 Usuários na tabela planos_usuarios:', planosUsers);
    
    // Se não houver usuários em nenhuma tabela, vamos testar a Edge Function diretamente
    console.log('🔧 Testando Edge Function diretamente...');
    
    const { data, error } = await supabase.functions.invoke('webhooks-aulagia', {
      body: {
        email: 'teste@exemplo.com',
        evento: 'compra aprovada',
        produto: 'Plano Professor (Mensal)',
        token: 'q64w1ncxx2k'
      }
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      return;
    }
    
    console.log('✅ Resposta da Edge Function:', data);
    
    // Verificar logs
    const { data: logs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logsError) {
      console.error('❌ Erro ao buscar logs:', logsError);
      return;
    }
    
    console.log('📝 Logs recentes:', logs);
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testWebhookDirect(); 