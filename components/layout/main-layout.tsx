'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { BottomNav } from './bottom-nav'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only redirect if we're sure there's no user after a reasonable loading time
    if (mounted && !loading && !user && !redirecting) {
      setRedirecting(true)
      router.push('/login')
    }
  }, [user, loading, router, mounted, redirecting])

  // Show loading state only briefly
  if (!mounted || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user and not loading, redirect (handled above)
  if (!user) {
    return null
  }

  // Render layout with header, sticky sidebar, and full-width content
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div className="w-full p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

