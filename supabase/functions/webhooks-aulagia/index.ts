import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
}

interface WebhookLog {
  email: string;
  evento: string;
  produto?: string;
  plano_aplicado?: string;
  status: string;
  erro_mensagem?: string;
  ip_address?: string;
  user_agent?: string;
  payload?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('🚀 Webhook recebido:', req.method, req.url);
  console.log('📋 Headers:', Object.fromEntries(req.headers.entries()));

  try {
    // Get request details
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    console.log('🌐 IP Address:', ipAddress);
    console.log('👤 User Agent:', userAgent);
    
    // Parse request body
    const body = await req.json();
    const payload: WebhookPayload = body;
    
    console.log('📥 Payload recebido:', payload);
    
    // Validate required fields
    if (!payload.email || !payload.evento) {
      console.error('❌ Campos obrigatórios faltando:', { email: payload.email, evento: payload.evento });
      
      const errorLog: WebhookLog = {
        email: payload.email || 'unknown',
        evento: payload.evento || 'unknown',
        produto: payload.produto,
        status: 'erro',
        erro_mensagem: 'Email e evento são obrigatórios',
        ip_address: ipAddress,
        user_agent: userAgent,
        payload: body
      };
      
      await logWebhookEvent(errorLog);
      
      return new Response(
        JSON.stringify({ error: 'Email e evento são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Optional token validation (if token is provided)
    if (payload.token && payload.token !== 'q64w1ncxx2k') {
      console.error('❌ Token inválido:', payload.token);
      
      const errorLog: WebhookLog = {
        email: payload.email,
        evento: payload.evento,
        produto: payload.produto,
        status: 'erro',
        erro_mensagem: 'Token inválido',
        ip_address: ipAddress,
        user_agent: userAgent,
        payload: body
      };
      
      await logWebhookEvent(errorLog);
      
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('✅ Validações passaram, processando evento...');
    
    // Process webhook event
    const result = await processWebhookEvent(payload);
    
    console.log('✅ Evento processado com sucesso:', result);
    
    // Log successful event
    const successLog: WebhookLog = {
      email: payload.email,
      evento: payload.evento,
      produto: payload.produto,
      plano_aplicado: result.planoAplicado,
      status: 'sucesso',
      ip_address: ipAddress,
      user_agent: userAgent,
      payload: body
    };
    
    await logWebhookEvent(successLog);
    
    console.log('📝 Log de sucesso registrado');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso',
        plano_aplicado: result.planoAplicado 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('💥 Erro ao processar webhook:', error);
    
    const errorLog: WebhookLog = {
      email: 'unknown',
      evento: 'unknown',
      status: 'erro',
      erro_mensagem: error.message,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      payload: { error: 'Falha ao processar webhook' }
    };
    
    await logWebhookEvent(errorLog);
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

async function processWebhookEvent(payload: WebhookPayload): Promise<{ planoAplicado: string }> {
  console.log('🔧 Iniciando processamento do evento:', payload.evento);
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Service Key configurada:', !!supabaseServiceKey);
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Find user by email
  console.log('🔍 Buscando usuário por email:', payload.email);
  const { data: user, error: userError } = await supabase
    .from('perfis')
    .select('user_id')
    .eq('email', payload.email)
    .single();
  
  if (userError || !user) {
    console.error('❌ Erro ao buscar usuário:', userError);
    throw new Error(`Usuário não encontrado: ${payload.email}`);
  }
  
  console.log('✅ Usuário encontrado:', user);
  
  const userId = user.user_id;
  let planoAplicado = 'gratuito';
  
  console.log('🎯 Processando evento:', payload.evento.toLowerCase());
  
  // Process event based on type
  switch (payload.evento.toLowerCase()) {
    case 'assinatura aprovada':
    case 'assinatura renovada':
      console.log('💰 Evento de assinatura aprovada/renovada');
      // Determine plan based on product
      if (payload.produto) {
        const produtoLower = payload.produto.toLowerCase();
        console.log('📦 Produto:', payload.produto, '->', produtoLower);
        
        if (produtoLower.includes('professor') && produtoLower.includes('mensal')) {
          planoAplicado = 'professor';
        } else if (produtoLower.includes('professor') && produtoLower.includes('anual')) {
          planoAplicado = 'professor';
        } else if (produtoLower.includes('grupo escolar') && produtoLower.includes('mensal')) {
          planoAplicado = 'grupo_escolar';
        } else if (produtoLower.includes('grupo escolar') && produtoLower.includes('anual')) {
          planoAplicado = 'grupo_escolar';
        } else {
          // Default to professor for any paid plan
          planoAplicado = 'professor';
        }
      } else {
        // Default to professor if no product specified
        planoAplicado = 'professor';
      }
      console.log('📋 Plano determinado:', planoAplicado);
      break;
      
    case 'assinatura cancelada':
    case 'assinatura atrasada':
    case 'assinatura expirada':
      console.log('❌ Evento de cancelamento/atraso/expirado');
      planoAplicado = 'gratuito';
      break;
      
    default:
      console.log('❓ Evento desconhecido, mantendo plano atual');
      // For unknown events, keep current plan or default to free
      const { data: currentPlan } = await supabase
        .from('perfis')
        .select('plano_ativo')
        .eq('user_id', userId)
        .single();
      
      planoAplicado = currentPlan?.plano_ativo || 'gratuito';
      console.log('📋 Plano atual mantido:', planoAplicado);
      break;
  }
  
  console.log('🔄 Atualizando plano do usuário:', userId, '->', planoAplicado);
  
  // Update user plan
  const { error: updateError } = await supabase
    .from('perfis')
    .update({
      plano_ativo: planoAplicado,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('❌ Erro ao atualizar plano:', updateError);
    throw new Error(`Erro ao atualizar plano: ${updateError.message}`);
  }
  
  console.log('✅ Plano atualizado com sucesso');
  
  return { planoAplicado };
}

async function logWebhookEvent(log: WebhookLog): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  await supabase
    .from('webhook_logs')
    .insert(log);
} 