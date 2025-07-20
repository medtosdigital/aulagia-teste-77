import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebhookLogInsert() {
  try {
    console.log('🧪 Testando inserção de log sem billing_type...');
    
    // Testar inserção sem billing_type
    const { data: insertTest1, error: insertError1 } = await supabase
      .from('webhook_logs')
      .insert({
        email: 'teste@exemplo.com',
        evento: 'teste_insercao_sem_billing',
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
        .eq('evento', 'teste_insercao_sem_billing');
      
      if (deleteError) {
        console.error('❌ Erro ao remover log de teste:', deleteError);
      } else {
        console.log('✅ Log de teste removido');
      }
    }
    
    // Verificar estrutura da tabela
    console.log('📋 Verificando estrutura da tabela...');
    const { data: structure, error: structureError } = await supabase
      .from('webhook_logs')
      .select('*')
      .limit(0);
    
    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError);
    } else {
      console.log('✅ Estrutura da tabela verificada');
    }
    
    console.log('🎉 Teste concluído!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testWebhookLogInsert(); 