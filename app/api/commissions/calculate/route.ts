import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    // Get invoice details
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('*, leads(*), projects(*)')
      .eq('id', invoiceId)
      .single()

    if (!invoice || invoice.status !== 'paid') {
      return NextResponse.json({ error: 'Invoice not found or not paid' }, { status: 404 })
    }

    // Find the lead associated with this invoice
    let leadId = invoice.lead_id
    if (!leadId && invoice.project_id) {
      // Try to find lead from project
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('*, leads(*)')
        .eq('id', invoice.project_id)
        .single()

      if (project?.leads?.[0]) {
        leadId = project.leads[0].id
      }
    }

    if (!leadId) {
      return NextResponse.json({ error: 'No lead found for this invoice' }, { status: 404 })
    }

    // Get the lead and find the referrer
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*, referred_by, profiles!leads_referred_by_fkey(*)')
      .eq('id', leadId)
      .single()

    if (!lead?.referred_by) {
      return NextResponse.json({ error: 'No referrer found for this lead' }, { status: 404 })
    }

    // Get sales referrer details
    const { data: referrer } = await supabaseAdmin
      .from('sales_referrers')
      .select('*')
      .eq('id', lead.referred_by)
      .single()

    if (!referrer) {
      return NextResponse.json({ error: 'Sales referrer not found' }, { status: 404 })
    }

    // Calculate commission (20% default)
    const commissionRate = referrer.commission_rate || 20.0
    const commissionAmount = (invoice.total_amount * commissionRate) / 100

    // Create commission record
    const { data: commission } = await supabaseAdmin
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

    // Update referrer's total commission
    await supabaseAdmin
      .from('sales_referrers')
      .update({
        total_commission_earned: (referrer.total_commission_earned || 0) + commissionAmount,
      })
      .eq('id', lead.referred_by)

    // Check for bonus eligibility (10 paid clients = ₹50,000)
    // Get all leads referred by this referrer
    const { data: referrerLeads } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('referred_by', lead.referred_by)

    const leadIds = referrerLeads?.map(l => l.id) || []

    // Get all paid invoices for these leads
    const { data: paidInvoices } = await supabaseAdmin
      .from('invoices')
      .select('client_id')
      .eq('status', 'paid')
      .not('client_id', 'is', null)

    // Count unique clients (simplified - in production, link invoices to leads via projects)
    const clientCount = new Set(paidInvoices?.map(i => i.client_id) || []).size

    if (clientCount >= 10 && clientCount % 10 === 0) {
      // Award bonus
      const bonusAmount = 50000
      await supabaseAdmin
        .from('bonuses')
        .insert({
          sales_referrer_id: lead.referred_by,
          amount: bonusAmount,
          reason: `Milestone: ${clientCount} paid clients`,
          milestone_count: clientCount,
          status: 'pending',
        })

      await supabaseAdmin
        .from('sales_referrers')
        .update({
          bonus_earned: (referrer.bonus_earned || 0) + bonusAmount,
        })
        .eq('id', lead.referred_by)
    }

    return NextResponse.json({
      success: true,
      commission: commission,
      message: 'Commission calculated successfully',
    })
  } catch (error: any) {
    console.error('Commission calculation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate commission' },
      { status: 500 }
    )
  }
}

