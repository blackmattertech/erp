import { MainLayout } from '@/components/layout/main-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeadsTable } from '@/components/crm/leads-table'

export default async function ReferrerLeadsPage() {
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

  if (!profile || profile.role !== 'sales_referrer') {
    redirect('/')
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('referred_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Leads</h1>
          <p className="text-muted-foreground">Track all leads you&apos;ve referred</p>
        </div>

        <LeadsTable leads={leads || []} />
      </div>
    </MainLayout>
  )
}

