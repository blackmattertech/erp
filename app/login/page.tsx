'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { getRedirectPathByRole } from '@/lib/utils/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (useMagicLink) {
        // Magic link login
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        toast({
          title: 'Check your email',
          description: 'We sent you a magic link to sign in.',
        })
      } else {
        // Password login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          toast({
            title: 'Success',
            description: 'Logged in successfully! Redirecting...',
          })
          
          // Quick session check (just 1 attempt, session should be immediate with createClientComponentClient)
          const { data: { session } } = await supabase.auth.getSession()
          
          if (!session) {
            // If no session, wait just a tiny bit for cookies
            await new Promise(resolve => setTimeout(resolve, 300))
          }
          
          // Get user profile quickly (single attempt, no retries)
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

          // Determine redirect path based on role
          const redirectPath = getRedirectPathByRole(profile?.role)
          
          // Immediate redirect - let the destination page handle any auth checks
          window.location.href = redirectPath
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to BlackMatter ERP</CardTitle>
          <CardDescription>
            {useMagicLink ? 'Enter your email to receive a magic link' : 'Enter your credentials to sign in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!useMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? (useMagicLink ? 'Sending...' : 'Signing in...') 
                : (useMagicLink ? 'Send Magic Link' : 'Sign In')}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-sm text-primary hover:underline w-full text-center"
            >
              {useMagicLink 
                ? 'Use password instead' 
                : 'Use magic link instead'}
            </button>
            <div className="text-center text-sm">
              <Link href="/signup" className="text-primary hover:underline">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

