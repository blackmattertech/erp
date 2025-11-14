'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profile)
        if (error) {
          console.error('Profile error:', error)
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Auth Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}
          </div>
          {user && (
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
          )}
          {user && (
            <div>
              <strong>User Email:</strong> {user.email}
            </div>
          )}
          <div>
            <strong>Profile:</strong> {profile ? 'Exists' : 'Missing'}
          </div>
          {profile && (
            <div>
              <strong>Profile Role:</strong> {profile.role}
            </div>
          )}
          {!profile && user && (
            <div className="text-red-600">
              Profile is missing! This is the issue.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

