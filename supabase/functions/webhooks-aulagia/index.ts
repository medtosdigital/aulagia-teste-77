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
  billing_type?: string;
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

  console.log('🚀 Webhook recebido da Kiwify');
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
    
    console.log('📥 Payload recebido da Kiwify:', payload);
    
    // Validate required fields
    if (!payload.email || !payload.evento) {
      console.error('❌ Campos obrigatórios faltando:', { email: payload.email, evento: payload.evento });
      
      const errorLog: WebhookLog = {
        email: payload.email || 'unknown',
        evento: payload.evento || 'unknown',
        produto: payload.produto,
        status: 'erro',
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
      billing_type: result.billingType,
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
        plano_aplicado: result.planoAplicado,
        billing_type: result.billingType
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
      payload: { error: 'Falha ao processar webhook' }
    };
    
    await logWebhookEvent(errorLog);
    
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
})

async function processWebhookEvent(payload: WebhookPayload): Promise<{ planoAplicado: string; billingType: string }> {
  console.log('🔧 Iniciando processamento do evento:', payload.evento);
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Service Key configurada:', !!supabaseServiceKey);
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Buscar usuário pelo email na tabela perfis
  console.log('🔍 Buscando usuário por email na tabela perfis:', payload.email);
  const { data: user, error: userError } = await supabase
    .from('perfis')
    .select('user_id, email, plano_ativo, billing_type')
    .eq('email', payload.email)
    .single();
  
  if (userError || !user) {
    console.error('❌ Usuário não encontrado na tabela perfis:', payload.email);
    
    // Para simulação, permitir usuário de teste
    if (payload.email === 'teste@exemplo.com') {
      console.log('🔧 Usuário de teste detectado, processando simulação...');
      
      let planoAplicado = 'gratuito';
      let billingType = 'gratuito';
      
      // Determinar plano baseado no evento e produto
      switch (payload.evento.toLowerCase()) {
        case 'compra aprovada':
        case 'assinatura aprovada':
        case 'assinatura renovada':
          if (payload.produto) {
            const produtoLower = payload.produto.toLowerCase();
            if (produtoLower.includes('professor')) {
              planoAplicado = 'professor';
            } else if (produtoLower.includes('grupo escolar')) {
              planoAplicado = 'grupo_escolar';
            } else {
              planoAplicado = 'professor';
            }
            
            // Determinar billing_type baseado no produto
            if (produtoLower.includes('mensal')) {
              billingType = 'mensal';
            } else if (produtoLower.includes('anual')) {
              billingType = 'anual';
            } else {
              billingType = 'mensal'; // Default
            }
          } else {
            planoAplicado = 'professor';
            billingType = 'mensal';
          }
          break;
        case 'assinatura cancelada':
        case 'assinatura atrasada':
          planoAplicado = 'gratuito';
          billingType = 'gratuito';
          break;
        default:
          planoAplicado = 'gratuito';
          billingType = 'gratuito';
          break;
      }
      
      console.log('📋 Plano determinado para simulação:', planoAplicado);
      console.log('📋 Billing type determinado para simulação:', billingType);
      return { planoAplicado, billingType };
    }
    
    throw new Error(`Usuário não encontrado: ${payload.email}. Verifique se o email está correto e se o usuário existe na tabela perfis.`);
  }
  
  console.log('✅ Usuário encontrado na tabela perfis:', user);
  console.log('📋 Plano atual do usuário:', user.plano_ativo);
  console.log('📋 Billing type atual do usuário:', user.billing_type);
  
  const userId = user.user_id;
  let planoAplicado = 'gratuito';
  let billingType = 'gratuito';
  
  console.log('🎯 Processando evento da Kiwify:', payload.evento.toLowerCase());
  
  // Processar evento baseado no tipo - Mapeamento correto dos eventos da Kiwify
  switch (payload.evento.toLowerCase()) {
    case 'compra aprovada':
    case 'assinatura aprovada':
    case 'assinatura renovada':
      console.log('💰 Evento de compra/assinatura aprovada/renovada');
      
      // Determinar plano baseado no produto
      if (payload.produto) {
        const produtoLower = payload.produto.toLowerCase();
        console.log('📦 Produto da Kiwify:', payload.produto, '->', produtoLower);
        
        // Mapeamento correto dos produtos para planos
        if (produtoLower.includes('professor')) {
          planoAplicado = 'professor';
          console.log('📋 Plano determinado: professor');
        } else if (produtoLower.includes('grupo escolar')) {
          planoAplicado = 'grupo_escolar';
          console.log('📋 Plano determinado: grupo_escolar');
        } else {
          // Default para professor para qualquer plano pago
          planoAplicado = 'professor';
          console.log('📋 Plano determinado: professor (default)');
        }
        
        // Determinar billing_type baseado no produto
        if (produtoLower.includes('mensal')) {
          billingType = 'mensal';
          console.log('📋 Billing type determinado: mensal');
        } else if (produtoLower.includes('anual')) {
          billingType = 'anual';
          console.log('📋 Billing type determinado: anual');
        } else {
          // Default para mensal se não especificado
          billingType = 'mensal';
          console.log('📋 Billing type determinado: mensal (default)');
        }
      } else {
        // Default para professor se nenhum produto especificado
        planoAplicado = 'professor';
        billingType = 'mensal';
        console.log('📋 Plano determinado: professor (sem produto)');
        console.log('📋 Billing type determinado: mensal (sem produto)');
      }
      break;
      
    case 'assinatura cancelada':
    case 'assinatura atrasada':
      console.log('❌ Evento de cancelamento/atraso');
      planoAplicado = 'gratuito';
      billingType = 'gratuito';
      console.log('📋 Plano determinado: gratuito (cancelado/atrasado)');
      console.log('📋 Billing type determinado: gratuito (cancelado/atrasado)');
      break;
      
    default:
      console.log('❓ Evento desconhecido:', payload.evento);
      // Para eventos desconhecidos, manter plano atual
      planoAplicado = user.plano_ativo || 'gratuito';
      billingType = user.billing_type || 'gratuito';
      console.log('📋 Plano atual mantido:', planoAplicado);
      console.log('📋 Billing type atual mantido:', billingType);
      break;
  }
  
  console.log('🔄 Atualizando plano do usuário:', userId, '->', planoAplicado);
  console.log('🔄 Atualizando billing type do usuário:', userId, '->', billingType);
  
  // Atualizar plano e billing_type do usuário na tabela perfis
  const { error: updateError } = await supabase
    .from('perfis')
    .update({
      plano_ativo: planoAplicado,
      billing_type: billingType,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('❌ Erro ao atualizar plano na tabela perfis:', updateError);
    throw new Error(`Erro ao atualizar plano: ${updateError.message}`);
  }
  
  console.log('✅ Plano e billing_type atualizados com sucesso na tabela perfis');
  
  // Também atualizar tabela planos_usuarios se existir
  try {
    const { error: planosUpdateError } = await supabase
      .from('planos_usuarios')
      .upsert({
        user_id: userId,
        plano_ativo: planoAplicado,
        billing_type: billingType,
        data_inicio: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (planosUpdateError) {
      console.warn('⚠️ Erro ao atualizar planos_usuarios (pode não existir):', planosUpdateError);
    } else {
      console.log('✅ Plano e billing_type atualizados com sucesso na tabela planos_usuarios');
    }
  } catch (error) {
    console.warn('⚠️ Erro ao atualizar planos_usuarios:', error);
  }
  
  console.log('🎉 Processamento concluído com sucesso!');
  return { planoAplicado, billingType };
}

async function logWebhookEvent(log: WebhookLog): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Inserir log com todos os campos incluindo billing_type
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        email: log.email,
        evento: log.evento,
        produto: log.produto,
        plano_aplicado: log.plano_aplicado,
        billing_type: log.billing_type,
        status: log.status,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        payload: log.payload
      });
    
    if (error) {
      console.error('❌ Erro ao registrar log:', error);
      
      // Se o erro for por causa do campo billing_type não existir, tentar sem ele
      if (error.message.includes('billing_type') || error.message.includes('column')) {
        console.log('🔄 Tentando inserir log sem billing_type...');
        const { error: retryError } = await supabase
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
        
        if (retryError) {
          console.error('❌ Erro ao registrar log sem billing_type:', retryError);
        } else {
          console.log('📝 Log registrado sem billing_type');
        }
      }
    } else {
      console.log('📝 Log registrado com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao registrar log:', error);
  }
} 