'use client'

import dynamic from 'next/dynamic'

const BuilderCanvas = dynamic(
  () => import('@/components/builder/BuilderCanvas'),
  { 
    ssr: false, 
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }
)

export default function BuilderPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen">
      <BuilderCanvas projectId={params.id} />
    </div>
  )
}
