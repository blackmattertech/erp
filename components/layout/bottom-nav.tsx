'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  DollarSign,
  MessageSquare,
} from 'lucide-react'

const mobileNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'project_manager'] },
  { title: 'Projects', href: '/projects', icon: Briefcase, roles: ['super_admin', 'project_manager', 'freelancer', 'client'] },
  { title: 'Invoices', href: '/invoices', icon: FileText, roles: ['super_admin', 'project_manager', 'client'] },
  { title: 'Payments', href: '/payments', icon: DollarSign, roles: ['super_admin', 'project_manager', 'client'] },
  { title: 'Messages', href: '/messages', icon: MessageSquare, roles: ['super_admin', 'project_manager', 'freelancer', 'client'] },
]

export function BottomNav() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const items = mobileNavItems.filter(item => 
    item.roles.includes(profile?.role || '')
  )

  // Don't show on login/signup pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

