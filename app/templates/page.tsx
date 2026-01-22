'use client'

import dynamic from 'next/dynamic'

const TemplateGallery = dynamic(
  () => import('@/components/templates/TemplateGallery'),
  { 
    ssr: false, 
    loading: () => (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)

export default function TemplatesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Template Gallery</h1>
      <TemplateGallery />
    </div>
  )
}
