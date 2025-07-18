
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  email: string;
  evento: string;
  produto?: string;
  token?: string;
  // Campos adicionais que podem vir do webhook
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔔 Webhook recebido:', req.method, req.url);

  try {
    // Inicializar cliente Supabase com service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se é POST
    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method);
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Obter dados do corpo da requisição
    let payload: WebhookPayload;
    try {
      payload = await req.json();
      console.log('📦 Payload recebido:', JSON.stringify(payload, null, 2));
    } catch (error) {
      console.log('❌ Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ error: 'JSON inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar campos obrigatórios
    if (!payload.email || !payload.evento) {
      console.log('❌ Campos obrigatórios ausentes');
      return new Response(
        JSON.stringify({ error: 'Email e evento são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar token de segurança se necessário
    const securityEnabled = Deno.env.get('WEBHOOK_SECURITY_ENABLED') === 'true';
    const expectedToken = Deno.env.get('WEBHOOK_SECURITY_TOKEN') || 'q64w1ncxx2k';
    
    if (securityEnabled && payload.token !== expectedToken) {
      console.log('❌ Token de segurança inválido');
      
      // Log do webhook com erro de autenticação
      await supabase.from('webhook_logs').insert({
        email: payload.email,
        evento: payload.evento,
        produto: payload.produto,
        status: 'erro_autenticacao',
        payload: payload,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

      return new Response(
        JSON.stringify({ error: 'Token de segurança inválido' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Processar webhook usando a função do banco
    console.log('🔄 Processando webhook...');
    const { data: result, error: processError } = await supabase.rpc('process_webhook', {
      p_email: payload.email,
      p_evento: payload.evento,
      p_produto: payload.produto,
      p_payload: payload
    });

    if (processError) {
      console.log('❌ Erro ao processar webhook:', processError);
      
      // Log do erro
      await supabase.from('webhook_logs').insert({
        email: payload.email,
        evento: payload.evento,
        produto: payload.produto,
        status: 'erro_processamento',
        payload: payload,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

      return new Response(
        JSON.stringify({ error: 'Erro ao processar webhook: ' + processError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Resultado do processamento:', result);

    // Log do webhook com sucesso
    await supabase.from('webhook_logs').insert({
      email: payload.email,
      evento: payload.evento,
      produto: payload.produto,
      plano_aplicado: result?.plano_aplicado,
      status: result?.success ? 'sucesso' : 'erro',
      payload: payload,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

    // Retornar resposta
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        result: result
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.log('❌ Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
