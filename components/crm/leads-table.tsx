'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lead } from '@/lib/types'
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

interface LeadsTableProps {
  leads: Lead[]
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  proposal: 'bg-purple-100 text-purple-800',
  negotiation: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [isMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640)

  if (isMobile) {
    return (
      <div className="space-y-4">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{lead.company_name}</CardTitle>
                  <CardDescription>{lead.contact_name}</CardDescription>
                </div>
                <Badge className={statusColors[lead.status] || ''}>
                  {lead.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span>{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.estimated_value && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">{formatCurrency(lead.estimated_value)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(lead.created_at)}</span>
              </div>
              <Link href={`/crm/leads/${lead.id}`}>
                <Button variant="outline" className="w-full mt-4">
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
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.company_name}</TableCell>
                <TableCell>{lead.contact_name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status] || ''}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.estimated_value ? formatCurrency(lead.estimated_value) : '-'}
                </TableCell>
                <TableCell>{formatDate(lead.created_at)}</TableCell>
                <TableCell>
                  <Link href={`/crm/leads/${lead.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

