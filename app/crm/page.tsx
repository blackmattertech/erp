import { MainLayout } from '@/components/layout/main-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeadsTable } from '@/components/crm/leads-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function CRMPage() {
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

  if (!profile || !['super_admin', 'sales_referrer', 'project_manager'].includes(profile.role)) {
    redirect('/')
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM - Leads</h1>
            <p className="text-muted-foreground">Manage your leads and track conversions</p>
          </div>
          <Link href="/crm/leads/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </Link>
        </div>

        <LeadsTable leads={leads || []} />
      </div>
    </MainLayout>
  )
}

