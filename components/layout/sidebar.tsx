'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Settings,
  Menu,
  X,
  Calendar,
  BarChart3,
  MessageSquare,
  UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'project_manager'] },
  { title: 'CRM', href: '/crm', icon: Users, roles: ['super_admin', 'sales_referrer', 'project_manager'] },
  { title: 'Freelancers', href: '/freelancers', icon: UserCog, roles: ['super_admin', 'project_manager'] },
  { title: 'Projects', href: '/projects', icon: Briefcase, roles: ['super_admin', 'project_manager', 'freelancer', 'client'] },
  { title: 'Invoices', href: '/invoices', icon: FileText, roles: ['super_admin', 'project_manager', 'client'] },
  { title: 'Payments', href: '/payments', icon: DollarSign, roles: ['super_admin', 'project_manager', 'client'] },
  { title: 'Reports', href: '/reports', icon: BarChart3, roles: ['super_admin', 'project_manager'] },
  { title: 'Messages', href: '/messages', icon: MessageSquare, roles: ['super_admin', 'project_manager', 'freelancer', 'client'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['super_admin', 'project_manager', 'freelancer', 'client', 'sales_referrer'] },
]

const referrerNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/referrer/dashboard', icon: LayoutDashboard, roles: ['sales_referrer'] },
  { title: 'My Leads', href: '/referrer/leads', icon: Users, roles: ['sales_referrer'] },
  { title: 'Commissions', href: '/referrer/commissions', icon: DollarSign, roles: ['sales_referrer'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['sales_referrer'] },
]

const clientNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard, roles: ['client'] },
  { title: 'My Projects', href: '/client/projects', icon: Briefcase, roles: ['client'] },
  { title: 'Invoices', href: '/client/invoices', icon: FileText, roles: ['client'] },
  { title: 'Payments', href: '/client/payments', icon: DollarSign, roles: ['client'] },
  { title: 'Messages', href: '/client/messages', icon: MessageSquare, roles: ['client'] },
]

const freelancerNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/freelancer/dashboard', icon: LayoutDashboard, roles: ['freelancer'] },
  { title: 'My Tasks', href: '/freelancer/tasks', icon: Briefcase, roles: ['freelancer'] },
  { title: 'Timesheets', href: '/freelancer/timesheets', icon: Calendar, roles: ['freelancer'] },
  { title: 'Earnings', href: '/freelancer/earnings', icon: DollarSign, roles: ['freelancer'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['freelancer'] },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { profile } = useAuth()

  const getNavItems = () => {
    if (!profile) return []
    if (profile.role === 'sales_referrer') return referrerNavItems
    if (profile.role === 'client') return clientNavItems
    if (profile.role === 'freelancer') return freelancerNavItems
    return navItems
  }

  const items = getNavItems().filter(item => 
    item.roles.includes(profile?.role || '')
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 h-[calc(100vh-4rem)] bg-card border-r z-40 transition-transform duration-300 overflow-y-auto',
          'lg:translate-x-0 lg:sticky lg:top-16 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">BlackMatter ERP</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

