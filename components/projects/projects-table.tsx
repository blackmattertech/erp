'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Project } from '@/lib/types'
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

interface ProjectsTableProps {
  projects: Project[]
}

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [isMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640)

  if (isMobile) {
    return (
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.description || 'No description'}</CardDescription>
                </div>
                <Badge className={statusColors[project.status] || ''}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.budget && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">{formatCurrency(project.budget)}</span>
                </div>
              )}
              {project.start_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{formatDate(project.start_date)}</span>
                </div>
              )}
              <Link href={`/projects/${project.id}`}>
                <Button variant="outline" className="w-full mt-4">
                  View Project
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
            <TableHead>Status</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <Badge className={statusColors[project.status] || ''}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.budget ? formatCurrency(project.budget) : '-'}
                </TableCell>
                <TableCell>
                  {project.start_date ? formatDate(project.start_date) : '-'}
                </TableCell>
                <TableCell>
                  <Link href={`/projects/${project.id}`}>
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

