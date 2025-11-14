import { MainLayout } from '@/components/layout/main-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvoicesTable } from '@/components/invoices/invoices-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function InvoicesPage() {
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

  if (!profile) {
    redirect('/login')
  }

  // Fetch invoices based on role
  let query = supabase.from('invoices').select('*')

  if (profile.role === 'client') {
    query = query.eq('client_id', user.id)
  }

  const { data: invoices } = await query.order('created_at', { ascending: false })

  const canCreate = ['super_admin', 'project_manager'].includes(profile.role)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage invoices and payments</p>
          </div>
          {canCreate && (
            <Link href="/invoices/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          )}
        </div>

        <InvoicesTable invoices={invoices || []} />
      </div>
    </MainLayout>
  )
}

