import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixWebhookLogsTable() {
  try {
    console.log('🔧 Corrigindo tabela webhook_logs...');
    
    // 1. Verificar se a tabela existe
    console.log('📋 Verificando tabela webhook_logs...');
    const { data: tableExists, error: tableError } = await supabase
      .from('webhook_logs')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return;
    }
    
    console.log('✅ Tabela webhook_logs existe');
    
    // 2. Tentar inserir um log sem billing_type para ver se funciona
    console.log('🧪 Testando inserção sem billing_type...');
    const { data: insertTest1, error: insertError1 } = await supabase
      .from('webhook_logs')
      .insert({
        email: 'teste@exemplo.com',
        evento: 'teste_sem_billing',
        produto: 'Plano Professor (Mensal)',
        plano_aplicado: 'professor',
        status: 'sucesso',
        erro_mensagem: null,
        ip_address: '127.0.0.1',
        user_agent: 'teste-script',
        payload: { teste: true }
      })
      .select();
    
    if (insertError1) {
      console.error('❌ Erro ao inserir log sem billing_type:', insertError1);
    } else {
      console.log('✅ Log sem billing_type inserido com sucesso:', insertTest1);
      
      // Remover o log de teste
      const { error: deleteError } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('email', 'teste@exemplo.com')
        .eq('evento', 'teste_sem_billing');
      
      if (deleteError) {
        console.error('❌ Erro ao remover log de teste:', deleteError);
      } else {
        console.log('✅ Log de teste removido');
      }
    }
    
    // 3. Tentar inserir um log com billing_type para ver se o campo existe
    console.log('🧪 Testando inserção com billing_type...');
    const { data: insertTest2, error: insertError2 } = await supabase
      .from('webhook_logs')
      .insert({
        email: 'teste@exemplo.com',
        evento: 'teste_com_billing',
        produto: 'Plano Professor (Mensal)',
        plano_aplicado: 'professor',
        billing_type: 'mensal',
        status: 'sucesso',
        erro_mensagem: null,
        ip_address: '127.0.0.1',
        user_agent: 'teste-script',
        payload: { teste: true }
      })
      .select();
    
    if (insertError2) {
      console.error('❌ Erro ao inserir log com billing_type:', insertError2);
      console.log('🔧 O campo billing_type não existe na tabela');
    } else {
      console.log('✅ Log com billing_type inserido com sucesso:', insertTest2);
      
      // Remover o log de teste
      const { error: deleteError2 } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('email', 'teste@exemplo.com')
        .eq('evento', 'teste_com_billing');
      
      if (deleteError2) {
        console.error('❌ Erro ao remover log de teste:', deleteError2);
      } else {
        console.log('✅ Log de teste removido');
      }
    }
    
    // 4. Verificar logs existentes
    console.log('📝 Verificando logs existentes...');
    const { data: existingLogs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logsError) {
      console.error('❌ Erro ao buscar logs existentes:', logsError);
    } else {
      console.log('✅ Logs existentes:', existingLogs);
    }
    
    console.log('🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

fixWebhookLogsTable(); 