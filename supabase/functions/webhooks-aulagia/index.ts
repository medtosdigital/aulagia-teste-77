
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
  ip_address?: string;
  user_agent?: string;
  payload?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('🚀 Webhook recebido da Kiwify - Método:', req.method);
  console.log('🔗 URL:', req.url);
  console.log('📋 Headers recebidos:', Object.fromEntries(req.headers.entries()));

  try {
    // Get request details for logging
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    console.log('🌐 IP Address:', ipAddress);
    console.log('👤 User Agent:', userAgent);
    
    // Parse request body
    const contentType = req.headers.get('content-type') || '';
    let payload: WebhookPayload;
    
    console.log('📤 Content-Type:', contentType);
    
    if (contentType.includes('application/json')) {
      const body = await req.json();
      payload = body;
      console.log('📥 Payload JSON recebido:', JSON.stringify(payload, null, 2));
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      payload = {
        email: formData.get('email')?.toString() || '',
        evento: formData.get('evento')?.toString() || '',
        produto: formData.get('produto')?.toString(),
        token: formData.get('token')?.toString()
      };
      console.log('📥 Payload Form recebido:', JSON.stringify(payload, null, 2));
    } else {
      const text = await req.text();
      console.log('📥 Payload Text recebido:', text);
      try {
        payload = JSON.parse(text);
      } catch {
        // Se não conseguir fazer parse como JSON, tentar extrair dados básicos
        payload = {
          email: '',
          evento: '',
          produto: undefined,
          token: undefined
        };
      }
    }
    
    // Validate required fields
    if (!payload.email || !payload.evento) {
      console.error('❌ Campos obrigatórios faltando:', { 
        email: payload.email, 
        evento: payload.evento,
        payload_completo: payload 
      });
      
      const errorLog: WebhookLog = {
        email: payload.email || 'unknown',
        evento: payload.evento || 'unknown',
        produto: payload.produto,
        status: 'erro',
        ip_address: ipAddress,
        user_agent: userAgent,
        payload: payload
      };
      
      await logWebhookEvent(errorLog);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email e evento são obrigatórios',
          received_data: payload 
        }),
        { 
          status: 400, 
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
      payload: payload
    };
    
    await logWebhookEvent(successLog);
    
    console.log('📝 Log de sucesso registrado');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso',
        plano_aplicado: result.planoAplicado,
        evento_processado: payload.evento,
        email_processado: payload.email
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
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      payload: { error: error.message }
    };
    
    await logWebhookEvent(errorLog);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

async function processWebhookEvent(payload: WebhookPayload): Promise<{ planoAplicado: string }> {
  console.log('🔧 Iniciando processamento do evento:', payload.evento);
  console.log('📧 Email do usuário:', payload.email);
  console.log('📦 Produto:', payload.produto);
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  console.log('🔗 Supabase URL configurada:', !!supabaseUrl);
  console.log('🔑 Service Key configurada:', !!supabaseServiceKey);
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Buscar usuário pelo email na tabela perfis
  console.log('🔍 Buscando usuário por email na tabela perfis:', payload.email);
  const { data: user, error: userError } = await supabase
    .from('perfis')
    .select('user_id, email, plano_ativo')
    .eq('email', payload.email)
    .single();
  
  if (userError || !user) {
    console.error('❌ Usuário não encontrado na tabela perfis:', payload.email, userError);
    
    // Para simulação, permitir usuário de teste
    if (payload.email === 'teste@exemplo.com' || payload.email.includes('@exemplo.com')) {
      console.log('🧪 Usuário de teste detectado, processando simulação...');
      return determinarPlanoSimulacao(payload);
    }
    
    throw new Error(`Usuário não encontrado: ${payload.email}. Verifique se o email está correto e se o usuário existe na tabela perfis.`);
  }
  
  console.log('✅ Usuário encontrado na tabela perfis:', user);
  console.log('📋 Plano atual do usuário:', user.plano_ativo);
  
  const userId = user.user_id;
  const planoAplicado = determinarPlano(payload);
  
  console.log('🔄 Atualizando plano do usuário:', userId, '->', planoAplicado);
  
  // Atualizar plano do usuário na tabela perfis
  const { error: updateError } = await supabase
    .from('perfis')
    .update({
      plano_ativo: planoAplicado,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('❌ Erro ao atualizar plano na tabela perfis:', updateError);
    throw new Error(`Erro ao atualizar plano: ${updateError.message}`);
  }
  
  console.log('✅ Plano atualizado com sucesso na tabela perfis');
  console.log('🎉 Processamento concluído!');
  
  return { planoAplicado };
}

function determinarPlano(payload: WebhookPayload): string {
  const evento = payload.evento.toLowerCase();
  const produto = payload.produto?.toLowerCase() || '';
  
  console.log('🎯 Determinando plano para evento:', evento, 'produto:', produto);
  
  // Processar eventos baseados no tipo
  switch (evento) {
    case 'compra aprovada':
    case 'assinatura aprovada':
    case 'assinatura renovada':
      console.log('💰 Evento de compra/assinatura aprovada/renovada');
      
      if (produto.includes('grupo escolar')) {
        console.log('🏫 Plano Grupo Escolar detectado');
        return 'grupo_escolar';
      } else if (produto.includes('professor')) {
        console.log('👨‍🏫 Plano Professor detectado');
        return 'professor';
      } else {
        console.log('👨‍🏫 Plano Professor aplicado (default para compra)');
        return 'professor';
      }
      
    case 'assinatura cancelada':
    case 'assinatura atrasada':
    case 'compra cancelada':
      console.log('❌ Evento de cancelamento/atraso - voltando para gratuito');
      return 'gratuito';
      
    default:
      console.log('❓ Evento desconhecido:', evento, '- mantendo gratuito');
      return 'gratuito';
  }
}

function determinarPlanoSimulacao(payload: WebhookPayload): { planoAplicado: string } {
  const planoAplicado = determinarPlano(payload);
  console.log('🧪 Plano determinado para simulação:', planoAplicado);
  return { planoAplicado };
}

async function logWebhookEvent(log: WebhookLog): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('📝 Registrando log do webhook:', log);
    
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        email: log.email,
        evento: log.evento,
        produto: log.produto,
        plano_aplicado: log.plano_aplicado,
        status: log.status,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        payload: log.payload
      });
    
    if (error) {
      console.error('❌ Erro ao registrar log:', error);
    } else {
      console.log('✅ Log registrado com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao registrar log:', error);
  }
}
