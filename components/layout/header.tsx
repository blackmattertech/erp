'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/use-auth'
import { Bell, Search, User, Settings, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export function Header() {
  const { profile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
              )}
            </Button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-card shadow-md z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3 mb-3">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.full_name || 'User'}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex flex-col space-y-1 flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {profile?.email}
                        </p>
                        {profile?.role && (
                          <Badge variant="outline" className="mt-1 w-fit">
                            {profile.role.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        signOut()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

