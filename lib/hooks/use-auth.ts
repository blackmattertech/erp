'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Profile, UserRole } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!mounted) return

        if (error || !user) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setUser(user)

        // Fetch profile in parallel, don't block on it
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }) => {
            if (mounted) {
              setProfile(profile)
            }
          })
          .catch(() => {
            // Profile might not exist yet, that's okay
            if (mounted) {
              setProfile(null)
            }
          })

        setLoading(false)
      } catch (error) {
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setProfile(null)
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          // Fetch profile but don't block
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (mounted) {
                setProfile(profile)
              }
            })
            .catch(() => {
              if (mounted) {
                setProfile(null)
              }
            })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const hasRole = (roles: UserRole[]) => {
    return profile && roles.includes(profile.role)
  }

  return {
    user,
    profile,
    loading,
    signOut,
    hasRole,
    isAuthenticated: !!user,
  }
}

