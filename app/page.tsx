'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getRedirectPathByRole } from '@/lib/utils/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push('/login')
          return
        }

        // Quick profile check (single attempt)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // If no profile, create one quickly
        if (!profile) {
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'client',
            })
            .select('role')
            .single()
        }

        // Redirect based on profile role
        const redirectPath = getRedirectPathByRole(profile?.role)
        router.push(redirectPath)
      } catch (error) {
        console.error('Error in home page:', error)
        router.push('/login')
      }
    }

    checkAuthAndRedirect()
  }, [router])

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

