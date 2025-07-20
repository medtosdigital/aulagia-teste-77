import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function recreateWebhookLogs() {
  try {
    console.log('🔧 Recriando tabela webhook_logs...');
    
    // 1. Deletar a tabela webhook_logs se existir
    console.log('🗑️ Deletando tabela webhook_logs existente...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS public.webhook_logs CASCADE;'
    });
    
    if (dropError) {
      console.error('❌ Erro ao deletar tabela:', dropError);
    } else {
      console.log('✅ Tabela webhook_logs deletada');
    }
    
    // 2. Criar a tabela webhook_logs com todos os campos
    console.log('🏗️ Criando nova tabela webhook_logs...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE public.webhook_logs (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT NOT NULL,
          evento TEXT NOT NULL,
          produto TEXT,
          plano_aplicado TEXT,
          billing_type TEXT,
          status TEXT NOT NULL,
          erro_mensagem TEXT,
          ip_address TEXT,
          user_agent TEXT,
          payload JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_webhook_logs_email ON public.webhook_logs(email);
        CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
        CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
        CREATE INDEX idx_webhook_logs_billing_type ON public.webhook_logs(billing_type);
      `
    });
    
    if (createError) {
      console.error('❌ Erro ao criar tabela webhook_logs:', createError);
      return;
    } else {
      console.log('✅ Tabela webhook_logs criada com sucesso');
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
    
    console.log('🎉 Tabela webhook_logs recriada com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

recreateWebhookLogs(); 