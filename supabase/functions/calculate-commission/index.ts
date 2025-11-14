import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { invoiceId } = await req.json()

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'Invoice ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*, projects(*, leads(*))')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find lead from project
    let leadId = null
    if (invoice.project_id && invoice.projects?.leads?.[0]) {
      leadId = invoice.projects.leads[0].id
    }

    if (!leadId) {
      return new Response(
        JSON.stringify({ error: 'No lead found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get lead and referrer
    const { data: lead } = await supabaseClient
      .from('leads')
      .select('*, referred_by')
      .eq('id', leadId)
      .single()

    if (!lead?.referred_by) {
      return new Response(
        JSON.stringify({ error: 'No referrer found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get referrer
    const { data: referrer } = await supabaseClient
      .from('sales_referrers')
      .select('*')
      .eq('id', lead.referred_by)
      .single()

    if (!referrer) {
      return new Response(
        JSON.stringify({ error: 'Sales referrer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate commission
    const commissionRate = referrer.commission_rate || 20.0
    const commissionAmount = (invoice.total_amount * commissionRate) / 100

    // Create commission
    const { data: commission } = await supabaseClient
      .from('commissions')
      .insert({
        sales_referrer_id: lead.referred_by,
        invoice_id: invoiceId,
        lead_id: leadId,
        commission_rate: commissionRate,
        invoice_amount: invoice.total_amount,
        commission_amount: commissionAmount,
        status: 'pending',
      })
      .select()
      .single()

    // Update referrer stats
    await supabaseClient
      .from('sales_referrers')
      .update({
        total_commission_earned: (referrer.total_commission_earned || 0) + commissionAmount,
      })
      .eq('id', lead.referred_by)

    return new Response(
      JSON.stringify({ success: true, commission }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

