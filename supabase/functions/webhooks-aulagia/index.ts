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

    // Extract relevant data from webhook
    const { 
      event_type, 
      data: { 
        customer_id, 
        subscription_id, 
        status,
        plan_type,
        billing_type 
      } 
    } = body

    // Handle different webhook events
    switch (event_type) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.renewed':
        await handleSubscriptionUpdate(supabase, customer_id, subscription_id, status, plan_type, billing_type)
        break
      
      case 'subscription.cancelled':
      case 'subscription.expired':
        await handleSubscriptionCancellation(supabase, customer_id, subscription_id)
        break
      
      default:
        console.log('Unhandled webhook event type:', event_type)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function handleSubscriptionUpdate(
  supabase: any, 
  customerId: string, 
  subscriptionId: string, 
  status: string, 
  planType: string, 
  billingType: string
) {
  try {
    console.log('Handling subscription update:', { customerId, subscriptionId, status, planType, billingType })

    // Map plan types to our internal plan names
    const planMapping: { [key: string]: string } = {
      'professor': 'professor',
      'grupo_escolar': 'grupo_escolar',
      'teacher': 'professor',
      'school_group': 'grupo_escolar'
    }

    const internalPlanType = planMapping[planType] || 'professor'
    const internalBillingType = billingType === 'yearly' ? 'yearly' : 'monthly'

    // Verificar se o plano existe na tabela de planos
    const { data: planData, error: planError } = await supabase
      .from('planos')
      .select('*')
      .eq('nome', internalPlanType)
      .eq('ativo', true)
      .single()

    if (planError || !planData) {
      console.error('Plano não encontrado ou inativo:', internalPlanType)
      return
    }

    // Find user by customer_id
    const { data: user, error: userError } = await supabase
      .from('perfis')
      .select('user_id, data_expiracao_plano')
      .eq('customer_id', customerId)
      .single()

    if (userError) {
      console.error('Error finding user by customer_id:', userError)
      return
    }

    if (!user) {
      console.error('User not found for customer_id:', customerId)
      return
    }

    // Calcular nova data de expiração
    const now = new Date()
    let expirationDate: Date

    if (user.data_expiracao_plano) {
      // Se já tem data de expiração, renovar a partir dela
      const currentExpiration = new Date(user.data_expiracao_plano)
      expirationDate = calculateExpirationDate(currentExpiration, internalBillingType)
    } else {
      // Se não tem, criar nova data de expiração
      expirationDate = calculateExpirationDate(now, internalBillingType)
    }

    // Update user's plan
    const { error: updateError } = await supabase
      .from('perfis')
      .update({
        plano_ativo: internalPlanType,
        billing_type: internalBillingType,
        data_inicio_plano: now.toISOString(),
        data_expiracao_plano: expirationDate.toISOString(),
        status_plano: 'ativo',
        ultima_renovacao: now.toISOString(),
        subscription_id: subscriptionId,
        customer_id: customerId
      })
      .eq('user_id', user.user_id)

    if (updateError) {
      console.error('Error updating user plan:', updateError)
      return
    }

    console.log('✅ User plan updated successfully:', user.user_id, 'Plano:', internalPlanType, 'Expiração:', expirationDate)

  } catch (error) {
    console.error('Error in handleSubscriptionUpdate:', error)
  }
}

async function handleSubscriptionCancellation(
  supabase: any, 
  customerId: string, 
  subscriptionId: string
) {
  try {
    console.log('Handling subscription cancellation:', { customerId, subscriptionId })

    // Find user by customer_id
    const { data: user, error: userError } = await supabase
      .from('perfis')
      .select('user_id')
      .eq('customer_id', customerId)
      .single()

    if (userError) {
      console.error('Error finding user by customer_id:', userError)
      return
    }

    if (!user) {
      console.error('User not found for customer_id:', customerId)
      return
    }

    // Revert to free plan with new expiration date
    const now = new Date()
    const expirationDate = calculateExpirationDate(now, 'monthly')

    const { error: updateError } = await supabase
      .from('perfis')
      .update({
        plano_ativo: 'gratuito',
        billing_type: 'monthly',
        data_inicio_plano: now.toISOString(),
        data_expiracao_plano: expirationDate.toISOString(),
        status_plano: 'cancelado',
        ultima_renovacao: now.toISOString(),
        subscription_id: null,
        customer_id: null
      })
      .eq('user_id', user.user_id)

    if (updateError) {
      console.error('Error reverting user to free plan:', updateError)
      return
    }

    console.log('✅ User reverted to free plan:', user.user_id, 'Nova expiração:', expirationDate)

  } catch (error) {
    console.error('Error in handleSubscriptionCancellation:', error)
  }
}

function calculateExpirationDate(startDate: Date, billingType: 'monthly' | 'yearly'): Date {
  const expirationDate = new Date(startDate)
  
  if (billingType === 'monthly') {
    expirationDate.setMonth(expirationDate.getMonth() + 1)
  } else {
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
  }
  
  return expirationDate
} 