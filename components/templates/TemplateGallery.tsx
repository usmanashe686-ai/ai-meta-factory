'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Download, Eye, Sparkles } from 'lucide-react'

const templates = [
  { id: 1, name: 'Admin Dashboard', category: 'Dashboard', rating: 4.8, downloads: 1250, featured: true },
  { id: 2, name: 'E-commerce Store', category: 'E-commerce', rating: 4.6, downloads: 890, featured: false },
  { id: 3, name: 'Blog Template', category: 'Blog', rating: 4.5, downloads: 750, featured: false },
  { id: 4, name: 'Portfolio', category: 'Portfolio', rating: 4.7, downloads: 620, featured: true },
  { id: 5, name: 'Landing Page', category: 'Marketing', rating: 4.4, downloads: 1100, featured: false },
  { id: 6, name: 'Mobile App UI', category: 'Mobile', rating: 4.9, downloads: 980, featured: true },
]

export default function TemplateGallery() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Popular Templates
          </h2>
          <p className="text-gray-600">Ready-to-use templates for your projects</p>
        </div>
        <Button variant="outline">View All</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className={`hover:shadow-xl transition-all duration-300 ${template.featured ? 'border-2 border-yellow-300' : ''}`}>
            {template.featured && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                FEATURED
              </div>
            )}
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">{template.category}</span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {template.rating}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {template.downloads.toLocaleString()} downloads
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
