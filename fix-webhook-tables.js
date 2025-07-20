import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixWebhookTables() {
  try {
    console.log('🔧 Verificando e corrigindo tabelas do webhook...');
    
    // 1. Verificar se a tabela perfis tem o campo billing_type
    console.log('📋 Verificando campo billing_type na tabela perfis...');
    const { data: perfisColumns, error: perfisError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'perfis')
      .eq('column_name', 'billing_type');
    
    if (perfisError) {
      console.error('❌ Erro ao verificar colunas da tabela perfis:', perfisError);
    } else {
      console.log('✅ Colunas da tabela perfis:', perfisColumns);
    }
    
    // 2. Verificar se a tabela webhook_logs existe
    console.log('📋 Verificando tabela webhook_logs...');
    const { data: webhookLogsTest, error: webhookLogsError } = await supabase
      .from('webhook_logs')
      .select('count')
      .limit(1);
    
    if (webhookLogsError) {
      console.error('❌ Erro ao acessar tabela webhook_logs:', webhookLogsError);
      console.log('🔧 Criando tabela webhook_logs...');
      
      // Tentar criar a tabela webhook_logs
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.webhook_logs (
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
          
          CREATE INDEX IF NOT EXISTS idx_webhook_logs_email ON public.webhook_logs(email);
          CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);
          CREATE INDEX IF NOT EXISTS idx_webhook_logs_billing_type ON public.webhook_logs(billing_type);
        `
      });
      
      if (createError) {
        console.error('❌ Erro ao criar tabela webhook_logs:', createError);
      } else {
        console.log('✅ Tabela webhook_logs criada com sucesso');
      }
    } else {
      console.log('✅ Tabela webhook_logs existe:', webhookLogsTest);
    }
    
    // 3. Verificar se a tabela webhook_logs tem o campo billing_type
    console.log('📋 Verificando campo billing_type na tabela webhook_logs...');
    const { data: webhookLogsColumns, error: webhookLogsColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'webhook_logs')
      .eq('column_name', 'billing_type');
    
    if (webhookLogsColumnsError) {
      console.error('❌ Erro ao verificar colunas da tabela webhook_logs:', webhookLogsColumnsError);
    } else {
      console.log('✅ Colunas da tabela webhook_logs:', webhookLogsColumns);
    }
    
    // 4. Testar inserção de log
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
    
    // 5. Verificar logs existentes
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

fixWebhookTables(); 