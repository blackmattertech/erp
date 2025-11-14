import { MainLayout } from '@/components/layout/main-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function FreelancerDashboardPage() {
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

  if (!profile || profile.role !== 'freelancer') {
    redirect('/')
  }

  // Get freelancer stats
  const { data: freelancer } = await supabase
    .from('freelancers')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get project memberships
  const { data: memberships } = await supabase
    .from('project_members')
    .select('project_id, projects(*)')
    .eq('member_id', user.id)

  const activeProjects = memberships?.length || 0

  // Get tasks assigned
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('assignee_id', user.id)

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0

  // Get time entries
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('hours')
    .eq('user_id', user.id)

  const totalHours = timeEntries?.reduce((sum, te) => sum + (parseFloat(te.hours.toString()) || 0), 0) || 0
  const estimatedEarnings = totalHours * (freelancer?.hourly_rate || 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
          <p className="text-muted-foreground">Track your work, time, and earnings</p>
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
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">{completedTasks} completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(estimatedEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                @ {formatCurrency(freelancer?.hourly_rate || 0)}/hr
              </p>
            </CardContent>
          </Card>
        </div>

        {freelancer && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Your listed skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills && freelancer.skills.length > 0 ? (
                    freelancer.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>Your current availability status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {freelancer.availability_status || 'Available'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

