import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWebhookLogsStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela webhook_logs...');
    
    // 1. Verificar se a tabela existe
    const { data: tableExists, error: tableError } = await supabase
      .from('webhook_logs')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao verificar tabela webhook_logs:', tableError);
      return;
    }
    
    console.log('✅ Tabela webhook_logs existe');
    
    // 2. Tentar inserir um log com billing_type para ver se o campo existe
    console.log('🧪 Testando inserção com billing_type...');
    const { data: insertTest, error: insertError } = await supabase
      .from('webhook_logs')
      .insert({
        email: 'teste@exemplo.com',
        evento: 'teste_billing_type',
        produto: 'Plano Professor (Mensal)',
        plano_aplicado: 'professor',
        billing_type: 'mensal',
        status: 'sucesso',
        ip_address: '127.0.0.1',
        user_agent: 'teste-script',
        payload: { teste: true }
      })
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir log com billing_type:', insertError);
      console.log('🔧 O campo billing_type não existe na tabela');
    } else {
      console.log('✅ Log com billing_type inserido com sucesso:', insertTest);
      
      // Remover o log de teste
      const { error: deleteError } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('email', 'teste@exemplo.com')
        .eq('evento', 'teste_billing_type');
      
      if (deleteError) {
        console.error('❌ Erro ao remover log de teste:', deleteError);
      } else {
        console.log('✅ Log de teste removido');
      }
    }
    
    // 3. Verificar logs existentes
    console.log('📝 Verificando logs existentes...');
    const { data: existingLogs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logsError) {
      console.error('❌ Erro ao buscar logs existentes:', logsError);
    } else {
      console.log('✅ Logs existentes:', existingLogs?.length || 0);
      if (existingLogs && existingLogs.length > 0) {
        console.log('📋 Exemplo de log:', existingLogs[0]);
      }
    }
    
    console.log('🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

checkWebhookLogsStructure(); 