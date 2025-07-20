import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  try {
    // Verificar se é uma requisição POST (para segurança)
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se há um token de autorização (opcional, para segurança)
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autorização necessário' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Aqui você pode adicionar validação do token se necessário
    // Por enquanto, vamos apenas verificar se existe

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Iniciando reset mensal de contadores de materiais...');

    // Resetar contadores de materiais para todos os usuários
    const { error } = await supabase
      .from('perfis')
      .update({
        materiais_criados_mes_atual: 0,
        ultimo_reset_materiais: new Date().toISOString()
      })
      .neq('user_id', ''); // Atualizar todos os usuários

    if (error) {
      console.error('❌ Erro ao resetar contadores de materiais:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Reset mensal de contadores de materiais concluído');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contadores de materiais resetados com sucesso',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 