import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWebhookTables() {
  try {
    console.log('🔧 Verificando tabelas do webhook...');
    
    // 1. Verificar se a tabela webhook_logs existe
    console.log('📋 Verificando tabela webhook_logs...');
    const { data: webhookLogsTest, error: webhookLogsError } = await supabase
      .from('webhook_logs')
      .select('count')
      .limit(1);
    
    if (webhookLogsError) {
      console.error('❌ Erro ao acessar tabela webhook_logs:', webhookLogsError);
      console.log('🔧 A tabela webhook_logs não existe ou não está acessível');
    } else {
      console.log('✅ Tabela webhook_logs existe:', webhookLogsTest);
    }
    
    // 2. Verificar se a tabela perfis tem o campo billing_type
    console.log('📋 Verificando campo billing_type na tabela perfis...');
    const { data: perfisTest, error: perfisError } = await supabase
      .from('perfis')
      .select('billing_type')
      .limit(1);
    
    if (perfisError) {
      console.error('❌ Erro ao verificar campo billing_type na tabela perfis:', perfisError);
    } else {
      console.log('✅ Campo billing_type existe na tabela perfis:', perfisTest);
    }
    
    // 3. Testar inserção de log
    console.log('🧪 Testando inserção de log...');
    const { data: insertTest, error: insertError } = await supabase
      .from('webhook_logs')
      .insert({
        email: 'teste@exemplo.com',
        evento: 'teste_insercao',
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
    
    if (insertError) {
      console.error('❌ Erro ao inserir log de teste:', insertError);
    } else {
      console.log('✅ Log de teste inserido com sucesso:', insertTest);
      
      // Remover o log de teste
      const { error: deleteError } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('email', 'teste@exemplo.com')
        .eq('evento', 'teste_insercao');
      
      if (deleteError) {
        console.error('❌ Erro ao remover log de teste:', deleteError);
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
    
    // 5. Verificar usuários na tabela perfis
    console.log('👥 Verificando usuários na tabela perfis...');
    const { data: users, error: usersError } = await supabase
      .from('perfis')
      .select('email, plano_ativo, billing_type')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log('✅ Usuários encontrados:', users);
    }
    
    console.log('🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

checkWebhookTables(); 