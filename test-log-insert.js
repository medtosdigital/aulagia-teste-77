import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogInsert() {
  try {
    console.log('🧪 Testando inserção de log diretamente no banco...');
    
    // Testar inserção de log básico
    const { data: insertTest, error: insertError } = await supabase
      .from('webhook_logs')
      .insert({
        email: 'teste@exemplo.com',
        evento: 'teste_insercao_direta',
        produto: 'Plano Professor (Mensal)',
        plano_aplicado: 'professor',
        status: 'sucesso',
        ip_address: '127.0.0.1',
        user_agent: 'teste-script',
        payload: { teste: true }
      })
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir log:', insertError);
    } else {
      console.log('✅ Log inserido com sucesso:', insertTest);
      
      // Remover o log de teste
      const { error: deleteError } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('email', 'teste@exemplo.com')
        .eq('evento', 'teste_insercao_direta');
      
      if (deleteError) {
        console.error('❌ Erro ao remover log de teste:', deleteError);
      } else {
        console.log('✅ Log de teste removido');
      }
    }
    
    // Verificar logs existentes
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
    
    console.log('🎉 Teste concluído!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testLogInsert(); 