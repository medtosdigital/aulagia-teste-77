
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the request body
    const body = await req.json()
    console.log('Webhook received:', body)

    // Capturar informações da requisição
    const userAgent = req.headers.get('user-agent') || null
    const ipAddress = req.headers.get('x-forwarded-for') || null

    // Extrair dados do payload da Kiwify
    const { email, evento, produto, token } = body

    // Validar token de segurança
    if (token !== 'i2ak29r42qk') {
      console.error('Token inválido:', token)
      await logWebhookAttempt(supabase, email, evento, produto, null, 'erro', 'Token inválido', userAgent, ipAddress, body)
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Verificar se o usuário existe na tabela perfis
    const { data: user, error: userError } = await supabase
      .from('perfis')
      .select('user_id, email, plano_ativo, billing_type')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.error('Usuário não encontrado:', email)
      await logWebhookAttempt(supabase, email, evento, produto, null, 'erro', 'Usuário não encontrado', userAgent, ipAddress, body)
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Processar evento baseado no tipo
    let planoAplicado = null
    let billingType = null

    try {
      switch (evento) {
        case 'compra aprovada':
        case 'assinatura aprovada':
        case 'assinatura renovada':
          const planData = getPlanoFromProduct(produto)
          planoAplicado = planData.plano
          billingType = planData.billingType
          
          // Atualizar plano do usuário
          const formaPagamento = body.forma_pagamento || body.pagamento || null;
          await updateUserPlan(supabase, user.user_id, planoAplicado, billingType, formaPagamento);
          break
        
        case 'assinatura cancelada':
          planoAplicado = 'gratuito'
          billingType = 'gratuito'
          
          // Voltar ao plano gratuito
          const formaPagamento = body.forma_pagamento || body.pagamento || null;
          await updateUserPlan(supabase, user.user_id, 'gratuito', 'gratuito', formaPagamento);
          break
        
        case 'assinatura atrasada':
          // Não alterar plano, apenas registrar o atraso
          planoAplicado = user.plano_ativo
          billingType = user.billing_type
          
          // Atualizar status do plano para atrasado
          await supabase
            .from('perfis')
            .update({ status_plano: 'atrasado' })
            .eq('user_id', user.user_id)
          break
        
        default:
          console.log('Evento não reconhecido:', evento)
          await logWebhookAttempt(supabase, email, evento, produto, null, 'erro', 'Evento não reconhecido', userAgent, ipAddress, body)
          return new Response(
            JSON.stringify({ error: 'Evento não reconhecido' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
      }

      // Log de sucesso
      await logWebhookAttempt(supabase, email, evento, produto, planoAplicado, 'sucesso', 'Processado com sucesso', userAgent, ipAddress, body)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook processado com sucesso',
          plano_aplicado: planoAplicado,
          billing_type: billingType
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      await logWebhookAttempt(supabase, email, evento, produto, null, 'erro_processamento', error.message, userAgent, ipAddress, body)
      
      return new Response(
        JSON.stringify({ error: 'Erro ao processar webhook' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

  } catch (error) {
    console.error('Erro geral do webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function updateUserPlan(supabase: any, userId: string, planoAtivo: string, billingType: string, formaPagamento: string | null = null) {
  // Buscar expiração atual
  const { data: perfil } = await supabase.from('perfis').select('data_expiracao_plano').eq('user_id', userId).single();
  const now = new Date();
  let dataExpiracao: Date | null = null;
  let baseDate = now;
  if (perfil && perfil.data_expiracao_plano) {
    const atual = new Date(perfil.data_expiracao_plano);
    if (atual > now) baseDate = atual;
  }
  // Calcular nova expiração
  if (planoAtivo !== 'gratuito') {
    if (billingType === 'mensal') {
      dataExpiracao = new Date(baseDate);
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
    } else if (billingType === 'anual') {
      dataExpiracao = new Date(baseDate);
      dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
    }
  }
  const { error } = await supabase
    .from('perfis')
    .update({
      plano_ativo: planoAtivo,
      billing_type: billingType,
      data_inicio_plano: now.toISOString(),
      data_expiracao_plano: dataExpiracao?.toISOString() || null,
      status_plano: 'ativo',
      materiais_criados_mes_atual: 0,
      ultimo_reset_materiais: now.toISOString(),
      ultima_renovacao: now.toISOString(),
      updated_at: now.toISOString(),
      forma_pagamento: formaPagamento
    })
    .eq('user_id', userId);
  if (error) {
    console.error('Erro ao atualizar plano do usuário:', error);
    throw error;
  }
  console.log(`✅ Plano do usuário ${userId} atualizado para ${planoAtivo}`);
}

function getPlanoFromProduct(produto: string): { plano: string; billingType: string } {
  if (!produto) return { plano: 'gratuito', billingType: 'gratuito' }
  
  const produtoLower = produto.toLowerCase()
  
  let plano = 'gratuito'
  let billingType = 'gratuito'
  
  // Determinar plano baseado no produto
  if (produtoLower.includes('professor')) {
    plano = 'professor'
  } else if (produtoLower.includes('grupo escolar')) {
    plano = 'grupo_escolar'
  }
  
  // Determinar billing type baseado no produto
  if (produtoLower.includes('mensal')) {
    billingType = 'mensal'
  } else if (produtoLower.includes('anual')) {
    billingType = 'anual'
  }
  
  return { plano, billingType }
}

async function logWebhookAttempt(
  supabase: any,
  email: string,
  evento: string,
  produto: string | null,
  planoAplicado: string | null,
  status: string,
  mensagem: string,
  userAgent: string | null,
  ipAddress: string | null,
  payload: any
) {
  try {
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        email,
        evento,
        produto,
        plano_aplicado: planoAplicado,
        status,
        ip_address: ipAddress,
        user_agent: userAgent,
        payload,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Erro ao registrar log:', error)
    }
  } catch (error) {
    console.error('Erro ao registrar log:', error)
  }
}
