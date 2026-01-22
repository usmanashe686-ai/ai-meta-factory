'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Folder, Calendar, User } from 'lucide-react'

const projects = [
  { id: 1, name: 'E-commerce Dashboard', type: 'Dashboard', created: '2 days ago', members: 3 },
  { id: 2, name: 'Social Media App', type: 'Mobile App', created: '1 week ago', members: 5 },
  { id: 3, name: 'Portfolio Website', type: 'Website', created: '3 days ago', members: 1 },
  { id: 4, name: 'Admin Panel', type: 'Admin', created: 'Today', members: 2 },
  { id: 5, name: 'Mobile Game UI', type: 'Game', created: '4 days ago', members: 4 },
  { id: 6, name: 'Analytics Dashboard', type: 'Analytics', created: '1 month ago', members: 1 },
]

export default function ProjectList() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-500" />
                {project.name}
              </CardTitle>
              <CardDescription>{project.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {project.created}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {project.members} member{project.members > 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                <Button size="sm" className="flex-1">Open</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
