'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { supabase } from '@/lib/supabase/client'
import { FreelancersTable } from '@/components/freelancers/freelancers-table'
import { CreateFreelancerDialog } from '@/components/freelancers/create-freelancer-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function FreelancersPage() {
  const router = useRouter()
  const [freelancers, setFreelancers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadFreelancers = async () => {
      try {
        // Check authentication
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push('/login')
          return
        }

        setUser(authUser)

        // Check profile and role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single()

        if (!profileData || !['super_admin', 'project_manager'].includes(profileData.role)) {
          router.push('/')
          return
        }

        setProfile(profileData)

        // Fetch freelancers with profile data
        const { data: freelancersData, error } = await supabase
          .from('freelancers')
          .select(`
            *,
            profiles:profiles!inner (
              full_name,
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching freelancers:', error)
        } else {
          setFreelancers(freelancersData || [])
        }
      } catch (error) {
        console.error('Error loading freelancers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFreelancers()
  }, [router])

  // Filter freelancers based on search term
  const filteredFreelancers = freelancers.filter((freelancer) => {
    if (!searchTerm) return true
    
    const search = searchTerm.toLowerCase()
    const name = freelancer.profiles?.full_name?.toLowerCase() || ''
    const email = freelancer.profiles?.email?.toLowerCase() || ''
    const skills = freelancer.skills?.join(' ').toLowerCase() || ''
    
    return name.includes(search) || email.includes(search) || skills.includes(search)
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading freelancers...</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Freelancers</h1>
            <p className="text-muted-foreground">Manage and view all freelancers</p>
          </div>
          {profile?.role === 'super_admin' && (
            <CreateFreelancerDialog
              onSuccess={() => {
                // Reload freelancers
                const reload = async () => {
                  const { data: updatedData } = await supabase
                    .from('freelancers')
                    .select(`
                      *,
                      profiles:profiles!inner (
                        full_name,
                        email,
                        phone
                      )
                    `)
                    .order('created_at', { ascending: false })
                  
                  if (updatedData) {
                    setFreelancers(updatedData)
                  }
                }
                reload()
              }}
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Freelancers</CardTitle>
            <CardDescription>Search by name, email, or skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search freelancers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Freelancers ({filteredFreelancers.length})</CardTitle>
            <CardDescription>
              {filteredFreelancers.length === freelancers.length
                ? 'Complete list of all freelancers'
                : `Showing ${filteredFreelancers.length} of ${freelancers.length} freelancers`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FreelancersTable
              freelancers={filteredFreelancers}
              onUpdate={() => {
                // Reload freelancers
                const reload = async () => {
                  const { data: updatedData } = await supabase
                    .from('freelancers')
                    .select(`
                      *,
                      profiles:profiles!inner (
                        full_name,
                        email,
                        phone
                      )
                    `)
                    .order('created_at', { ascending: false })
                  
                  if (updatedData) {
                    setFreelancers(updatedData)
                  }
                }
                reload()
              }}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

