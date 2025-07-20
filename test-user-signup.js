import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmxpteviwcnrljtxvaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHB0ZXZpd2NucmxqdHh2YW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTc5NzMsImV4cCI6MjA2Njc5Mzk3M30.-wSm455jQbizGZn4ceJATXyftbjBhfXA_l0ZZc5IieU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserSignup() {
  try {
    console.log('🧪 Testando processo completo de criação de usuário...');
    
    const testEmail = `teste-${Date.now()}@exemplo.com`;
    const testPassword = '123456';
    const testName = 'Usuário Teste';
    
    console.log('📧 Email de teste:', testEmail);
    console.log('👤 Nome de teste:', testName);
    
    // 1. Tentar criar usuário via Supabase Auth
    console.log('🚀 Criando usuário via Supabase Auth...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Erro ao criar usuário:', signUpError);
      return;
    }
    
    console.log('✅ Usuário criado via Auth:', signUpData.user?.id);
    console.log('📧 Email confirmado:', signUpData.user?.email_confirmed_at);
    
    // 2. Verificar se o perfil foi criado automaticamente
    console.log('🔍 Verificando se perfil foi criado...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar trigger
    
    const { data: profile, error: profileError } = await supabase
      .from('perfis')
      .select('*')
      .eq('user_id', signUpData.user?.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil criado automaticamente:', profile);
    }
    
    // 3. Tentar fazer login com o usuário criado
    console.log('🔐 Testando login com usuário criado...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Erro ao fazer login:', signInError);
    } else {
      console.log('✅ Login realizado com sucesso:', signInData.user?.id);
      
      // 4. Verificar perfil após login
      const { data: profileAfterLogin, error: profileAfterLoginError } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', signInData.user?.id)
        .single();
      
      if (profileAfterLoginError) {
        console.error('❌ Erro ao buscar perfil após login:', profileAfterLoginError);
      } else {
        console.log('✅ Perfil após login:', profileAfterLogin);
      }
    }
    
    // 5. Limpar usuário de teste
    console.log('🧹 Limpando usuário de teste...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(signUpData.user?.id);
    
    if (deleteError) {
      console.error('❌ Erro ao deletar usuário de teste:', deleteError);
    } else {
      console.log('✅ Usuário de teste removido');
    }
    
    console.log('🎉 Teste concluído!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testUserSignup(); 