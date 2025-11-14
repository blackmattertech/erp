import { MainLayout } from '@/components/layout/main-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function ReferrerDashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, referral_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'sales_referrer') {
    redirect('/')
  }

  // Get referrer stats
  const { data: referrer } = await supabase
    .from('sales_referrers')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get leads count
  const { data: leads } = await supabase
    .from('leads')
    .select('id, status')
    .eq('referred_by', user.id)

  const totalLeads = leads?.length || 0
  const wonLeads = leads?.filter(l => l.status === 'won').length || 0

  // Get commissions
  const { data: commissions } = await supabase
    .from('commissions')
    .select('*')
    .eq('sales_referrer_id', user.id)

  const totalCommission = commissions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0
  const pendingCommission = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0) || 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sales Referrer Dashboard</h1>
          <p className="text-muted-foreground">Track your leads, commissions, and bonuses</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">Your Referral ID:</p>
          <p className="text-2xl font-bold text-blue-600">{profile.referral_id}</p>
          <p className="text-xs text-blue-700 mt-2">Share this ID with potential clients to track referrals</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wonLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingCommission)}</div>
            </CardContent>
          </Card>
        </div>

        {referrer && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bonus Earned</CardTitle>
                <CardDescription>Total bonuses received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(referrer.bonus_earned || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Paid Clients</CardTitle>
                <CardDescription>Clients with paid invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{referrer.total_paid_clients || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Next bonus at 10, 20, 30... paid clients (₹50,000 each)
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

