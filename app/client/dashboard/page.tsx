'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function ClientDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  })

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Quick auth check
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push('/login')
          return
        }

        setUser(authUser)

        // Get or create profile (non-blocking)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single()

        let userProfile = profileData

        if (profileError || !profileData) {
          // Try to create profile, but don't block on it
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              role: 'client',
            })
            .select('role')
            .single()
          
          userProfile = newProfile || null
        }

        // If user has a different role, redirect
        if (userProfile && userProfile.role !== 'client') {
          router.push('/')
          return
        }

        setProfile(userProfile || { role: 'client' }) // Default to client if no profile

        // Load stats in parallel
        const [projectsResult, invoicesResult] = await Promise.all([
          supabase.from('projects').select('id, status').eq('client_id', authUser.id),
          supabase.from('invoices').select('id, total_amount, paid_amount, status').eq('client_id', authUser.id),
        ])

        setStats({
          totalProjects: projectsResult.data?.length || 0,
          activeProjects: projectsResult.data?.filter(p => p.status === 'active').length || 0,
          totalInvoices: invoicesResult.data?.length || 0,
          totalAmount: invoicesResult.data?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
          paidAmount: invoicesResult.data?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0,
          pendingAmount: (invoicesResult.data?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0) - 
                        (invoicesResult.data?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0),
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">Welcome! Here's an overview of your account</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">{stats.activeProjects} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingAmount)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>View and manage your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/client/projects">
                <Button variant="outline" className="w-full">
                  View Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Invoices & Payments</CardTitle>
              <CardDescription>View invoices and make payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/client/invoices">
                <Button variant="outline" className="w-full">
                  View Invoices <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

