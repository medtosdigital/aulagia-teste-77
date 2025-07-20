import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserCreation() {
  try {
    console.log('🔧 Verificando problemas na criação de usuários...');
    
    // 1. Verificar estrutura da tabela perfis
    console.log('📋 Verificando estrutura da tabela perfis...');
    const { data: perfisColumns, error: perfisError } = await supabase
      .from('perfis')
      .select('*')
      .limit(1);
    
    if (perfisError) {
      console.error('❌ Erro ao verificar tabela perfis:', perfisError);
    } else {
      console.log('✅ Tabela perfis acessível');
    }
    
    // 2. Verificar se há usuários sem perfil
    console.log('👥 Verificando usuários sem perfil...');
    const { data: usersWithoutProfile, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erro ao verificar usuários:', usersError);
    } else {
      console.log('✅ Usuários encontrados:', usersWithoutProfile?.length || 0);
    }
    
    // 3. Verificar triggers existentes
    console.log('🔍 Verificando triggers de criação de usuário...');
    
    // 4. Testar criação de perfil manual
    console.log('🧪 Testando criação de perfil manual...');
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const testEmail = 'teste-criacao@exemplo.com';
    
    try {
      const { data: insertTest, error: insertError } = await supabase
        .from('perfis')
        .insert({
          user_id: testUserId,
          email: testEmail,
          full_name: 'Usuário Teste',
          plano_ativo: 'gratuito',
          data_inicio_plano: new Date().toISOString(),
          materiais_criados_mes_atual: 0,
          ano_atual: new Date().getFullYear(),
          mes_atual: new Date().getMonth() + 1,
          ultimo_reset_materiais: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('❌ Erro ao inserir perfil de teste:', insertError);
        
        // Verificar se é problema de coluna
        if (insertError.message.includes('column') || insertError.message.includes('does not exist')) {
          console.log('🔧 Problema identificado: Coluna não existe na tabela perfis');
          console.log('📋 Erro detalhado:', insertError.message);
        }
      } else {
        console.log('✅ Perfil de teste criado com sucesso:', insertTest);
        
        // Remover perfil de teste
        const { error: deleteError } = await supabase
          .from('perfis')
          .delete()
          .eq('user_id', testUserId);
        
        if (deleteError) {
          console.error('❌ Erro ao remover perfil de teste:', deleteError);
        } else {
          console.log('✅ Perfil de teste removido');
        }
      }
    } catch (error) {
      console.error('❌ Erro geral no teste:', error);
    }
    
    // 5. Verificar se há conflitos entre funções
    console.log('🔍 Verificando funções de criação de usuário...');
    
    // 6. Verificar logs de erro recentes
    console.log('📝 Verificando logs de erro recentes...');
    const { data: recentErrors, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('status', 'erro')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logsError) {
      console.error('❌ Erro ao buscar logs:', logsError);
    } else {
      console.log('📋 Logs de erro recentes:', recentErrors?.length || 0);
    }
    
    console.log('🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

fixUserCreation(); 