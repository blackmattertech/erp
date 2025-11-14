import { MainLayout } from '@/components/layout/main-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'project_manager'].includes(profile.role)) {
    redirect('/')
  }

  // Fetch dashboard stats
  const [projectsResult, invoicesResult, leadsResult, paymentsResult] = await Promise.all([
    supabase.from('projects').select('id, status, budget, actual_cost').eq('status', 'active'),
    supabase.from('invoices').select('id, total_amount, paid_amount, status'),
    supabase.from('leads').select('id, status').eq('status', 'won'),
    supabase.from('payments').select('amount').eq('status', 'completed'),
  ])

  const activeProjects = projectsResult.data?.length || 0
  const totalRevenue = invoicesResult.data?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0
  const wonLeads = leadsResult.data?.length || 0
  const totalPayments = paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
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
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

