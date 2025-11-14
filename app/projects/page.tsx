import { MainLayout } from '@/components/layout/main-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsTable } from '@/components/projects/projects-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
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

  // Fetch projects based on role
  let query = supabase.from('projects').select('*')

  if (profile.role === 'client') {
    query = query.eq('client_id', user.id)
  } else if (profile.role === 'freelancer') {
    // Get projects where user is a member
    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('member_id', user.id)

    if (memberProjects && memberProjects.length > 0) {
      query = query.in('id', memberProjects.map(p => p.project_id))
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000') // No projects
    }
  }

  const { data: projects } = await query.order('created_at', { ascending: false })

  const canCreate = ['super_admin', 'project_manager'].includes(profile.role)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage your projects and track progress</p>
          </div>
          {canCreate && (
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          )}
        </div>

        <ProjectsTable projects={projects || []} />
      </div>
    </MainLayout>
  )
}

