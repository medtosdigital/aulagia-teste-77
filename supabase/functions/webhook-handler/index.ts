
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

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request data
    const body = await req.json()
    const userAgent = req.headers.get('user-agent') || null
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     null

    console.log('Webhook received:', body)

    // Extract email and event type from webhook body
    const email = body.email || body.customer?.email || body.data?.email
    const evento = body.event_type || body.type || body.evento || 'unknown'
    const produto = body.product || body.data?.product || null

    if (!email) {
      await logWebhook(supabase, {
        email: 'unknown',
        evento,
        produto,
        status: 'erro',
        ip_address: ipAddress,
        user_agent: userAgent,
        payload: body
      })

      return new Response(
        JSON.stringify({ error: 'Email not found in webhook payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process the webhook based on event type
    let planoAplicado = null
    let status = 'sucesso'

    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('email', email)
        .single()

      if (profileError || !profile) {
        console.log('User not found for email:', email)
        status = 'usuario_nao_encontrado'
      } else {
        // Map event types to plan updates
        const eventToPlanMap: Record<string, string> = {
          'payment.success': 'professor',
          'payment.paid': 'professor',
          'subscription.created': 'professor',
          'subscription.active': 'professor',
          'subscription.renewed': 'professor',
          'invoice.paid': 'professor',
          'payment.approved': 'professor',
          'subscription.cancelled': 'gratuito',
          'subscription.expired': 'gratuito',
          'payment.failed': 'gratuito',
          'payment.refunded': 'gratuito',
          'subscription.grupo_escolar': 'grupo_escolar'
        }

        const newPlan = eventToPlanMap[evento.toLowerCase()]

        if (newPlan) {
          // Calculate expiration date (1 year for paid plans)
          let dataExpiracao = null
          if (newPlan !== 'gratuito') {
            const expirationDate = new Date()
            expirationDate.setFullYear(expirationDate.getFullYear() + 1)
            dataExpiracao = expirationDate.toISOString()
          }

          // Update user plan
          const { error: updateError } = await supabase
            .from('planos_usuarios')
            .upsert({
              user_id: profile.user_id,
              plano_ativo: newPlan,
              data_expiracao: dataExpiracao,
              updated_at: new Date().toISOString()
            })

          if (updateError) {
            console.error('Error updating plan:', updateError)
            status = 'erro_atualizacao'
          } else {
            planoAplicado = newPlan
            console.log(`Plan updated to ${newPlan} for user ${email}`)

            // Reset monthly usage if upgrading to paid plan
            if (newPlan !== 'gratuito') {
              const currentYear = new Date().getFullYear()
              const currentMonth = new Date().getMonth() + 1

              await supabase
                .from('uso_mensal_materiais')
                .upsert({
                  user_id: profile.user_id,
                  ano: currentYear,
                  mes: currentMonth,
                  materiais_criados: 0,
                  updated_at: new Date().toISOString()
                })
            }
          }
        } else {
          console.log('Unhandled event type:', evento)
          status = 'evento_nao_mapeado'
        }
      }
    } catch (error) {
      console.error('Error processing webhook:', error)
      status = 'erro_processamento'
    }

    // Log the webhook
    await logWebhook(supabase, {
      email,
      evento,
      produto,
      plano_aplicado: planoAplicado,
      status,
      ip_address: ipAddress,
      user_agent: userAgent,
      payload: body
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        status,
        plano_aplicado: planoAplicado 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function logWebhook(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('webhook_logs')
      .insert(data)

    if (error) {
      console.error('Error logging webhook:', error)
    }
  } catch (error) {
    console.error('Error in logWebhook:', error)
  }
}
