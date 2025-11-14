import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const supabase = createServerSupabaseClient()

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id

      // Find payment record
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .single()

      if (paymentRecord) {
        // Update payment status
        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: payment.id,
            razorpay_signature: signature,
            status: 'completed',
            payment_date: new Date().toISOString(),
            payment_method: payment.method,
          })
          .eq('id', paymentRecord.id)

        // Update invoice paid amount
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', paymentRecord.invoice_id)
          .single()

        if (invoice) {
          const newPaidAmount = (invoice.paid_amount || 0) + paymentRecord.amount
          const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 'sent'

          await supabase
            .from('invoices')
            .update({
              paid_amount: newPaidAmount,
              status: newStatus,
            })
            .eq('id', invoice.id)

          // Trigger commission calculation if invoice is fully paid
          if (newStatus === 'paid') {
            // This will be handled by edge function
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/commissions/calculate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ invoiceId: invoice.id }),
            })
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

