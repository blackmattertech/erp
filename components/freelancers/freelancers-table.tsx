'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface Freelancer {
  id: string
  profiles: {
    full_name: string | null
    email: string
    phone: string | null
  }
  skills: string[] | null
  hourly_rate: number | null
  availability_status: string | null
  bio: string | null
  approval_status: string | null
  created_at: string
}

interface FreelancersTableProps {
  freelancers: Freelancer[]
  onUpdate?: () => void
}

const availabilityColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-yellow-100 text-yellow-800',
  unavailable: 'bg-red-100 text-red-800',
}

const approvalColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function FreelancersTable({ freelancers, onUpdate }: FreelancersTableProps) {
  const [isMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640)
  const [processing, setProcessing] = useState<string | null>(null)
  const { toast } = useToast()

  const handleApproval = async (freelancerId: string, status: 'approved' | 'rejected') => {
    setProcessing(freelancerId)
    try {
      const { error } = await supabase
        .from('freelancers')
        .update({ approval_status: status })
        .eq('id', freelancerId)

      if (error) throw error

      // If approved, also activate the profile
      if (status === 'approved') {
        await supabase
          .from('profiles')
          .update({ is_active: true })
          .eq('id', freelancerId)
      }

      toast({
        title: 'Success',
        description: `Freelancer ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      })

      if (onUpdate) {
        onUpdate()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update approval status',
        variant: 'destructive',
      })
    } finally {
      setProcessing(null)
    }
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {freelancers.map((freelancer) => (
          <Card key={freelancer.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {freelancer.profiles.full_name || 'No Name'}
                  </CardTitle>
                  <CardDescription>{freelancer.profiles.email}</CardDescription>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {freelancer.approval_status && (
                    <Badge className={approvalColors[freelancer.approval_status] || ''}>
                      {freelancer.approval_status}
                    </Badge>
                  )}
                  {freelancer.availability_status && (
                    <Badge className={availabilityColors[freelancer.availability_status] || ''}>
                      {freelancer.availability_status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {freelancer.profiles.phone && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{freelancer.profiles.phone}</span>
                </div>
              )}
              {freelancer.hourly_rate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hourly Rate:</span>
                  <span className="font-medium">{formatCurrency(freelancer.hourly_rate)}</span>
                </div>
              )}
              {freelancer.skills && freelancer.skills.length > 0 && (
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-muted-foreground">Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {freelancer.skills.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {freelancer.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{freelancer.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Joined:</span>
                <span>{formatDate(freelancer.created_at)}</span>
              </div>
              {freelancer.approval_status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApproval(freelancer.id, 'approved')}
                    disabled={processing === freelancer.id}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApproval(freelancer.id, 'rejected')}
                    disabled={processing === freelancer.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
              <Link href={`/freelancers/${freelancer.id}`} className="mt-2">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead>Hourly Rate</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {freelancers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No freelancers found
              </TableCell>
            </TableRow>
          ) : (
            freelancers.map((freelancer) => (
              <TableRow key={freelancer.id}>
                <TableCell className="font-medium">
                  {freelancer.profiles.full_name || 'No Name'}
                </TableCell>
                <TableCell>{freelancer.profiles.email}</TableCell>
                <TableCell>{freelancer.profiles.phone || '-'}</TableCell>
                <TableCell>
                  {freelancer.skills && freelancer.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {freelancer.skills.slice(0, 2).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {freelancer.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{freelancer.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {freelancer.hourly_rate ? formatCurrency(freelancer.hourly_rate) : '-'}
                </TableCell>
                <TableCell>
                  {freelancer.availability_status ? (
                    <Badge className={availabilityColors[freelancer.availability_status] || ''}>
                      {freelancer.availability_status}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {freelancer.approval_status ? (
                    <div className="flex flex-col gap-1">
                      <Badge className={approvalColors[freelancer.approval_status] || ''}>
                        {freelancer.approval_status}
                      </Badge>
                      {freelancer.approval_status === 'pending' && (
                        <div className="flex gap-1 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproval(freelancer.id, 'approved')}
                            disabled={processing === freelancer.id}
                            title="Approve"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleApproval(freelancer.id, 'rejected')}
                            disabled={processing === freelancer.id}
                            title="Decline"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{formatDate(freelancer.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/freelancers/${freelancer.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

