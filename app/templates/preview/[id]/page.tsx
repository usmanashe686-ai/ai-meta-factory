'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Heart, Share2, Download, Palette, 
  Zap, Users, Star, Clock, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import LiveCustomizer from '@/components/templates/LiveCustomizer'
import TemplatePreview from '@/components/templates/TemplatePreview'
import { Template } from '@/lib/templates/template.types'

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [customizedTemplate, setCustomizedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'preview' | 'customize'>('preview')
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    // Get user ID from localStorage or auth
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
    }
    
    fetchTemplate()
  }, [templateId])
  
  const fetchTemplate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/templates/${templateId}`)
      const data = await response.json()
      
      if (data.success) {
        setTemplate(data.data)
        setCustomizedTemplate(data.data)
      } else {
        toast.error('Template not found')
        router.push('/templates')
      }
    } catch (error) {
      console.error('Error fetching template:', error)
      toast.error('Failed to load template')
    } finally {
      setLoading(false)
    }
  }
  
  const handleUseTemplate = async () => {
    try {
      const response = await fetch('/api/templates/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateId,
          userId,
          isCustomized: isCustomizing,
          customizedData: isCustomizing ? customizedTemplate : null
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('Template loaded in builder!')
        router.push(`/builder/new?template=${templateId}`)
      }
    } catch (error) {
      console.error('Error using template:', error)
      toast.error('Failed to use template')
    }
  }
  
  const handleCustomize = useCallback((customized: Template) => {
    setCustomizedTemplate(customized)
    setIsCustomizing(true)
  }, [])
  
  const handleFavorite = async () => {
    if (!userId) {
      toast.error('Please sign in to favorite templates')
      return
    }
    
    try {
      const response = await fetch('/api/templates/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, userId })
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('Added to favorites!')
      }
    } catch (error) {
      console.error('Error favoriting template:', error)
    }
  }
  
  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }
  
  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Template not found</h2>
          <Button onClick={() => router.push('/templates')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/templates')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{template.name}</h1>
                <p className="text-gray-600">{template.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleFavorite}
                className="flex items-center"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favorite
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleUseTemplate}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {isCustomizing ? 'Use Customized' : 'Use Template'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Template Info Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold">{template.rating.toFixed(1)}</span>
                  <span className="text-gray-600 ml-1">({template.reviewCount} reviews)</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {template.usageCount} uses
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {template.estimatedBuildTime}
              </div>
              <div className="flex items-center">
                <div className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  {template.difficulty}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Button
                variant={activeTab === 'preview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('preview')}
                size="sm"
                className="mr-2"
              >
                Preview
              </Button>
              <Button
                variant={activeTab === 'customize' ? 'default' : 'outline'}
                onClick={() => setActiveTab('customize')}
                size="sm"
                className="flex items-center"
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex">
          {/* Preview Area */}
          <div className={`${activeTab === 'customize' ? 'w-3/4' : 'w-full'} pr-6`}>
            {activeTab === 'preview' ? (
              <TemplatePreview template={template} />
            ) : (
              <div className="bg-white rounded-lg border p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">Live Customization</h2>
                  <p className="text-gray-600">
                    Customize this template in real-time. Changes will be applied immediately.
                  </p>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  {customizedTemplate && (
                    <TemplatePreview template={customizedTemplate} />
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Customizer Panel */}
          {activeTab === 'customize' && customizedTemplate && (
            <LiveCustomizer
              template={template}
              onCustomize={handleCustomize}
              userId={userId}
            />
          )}
        </div>
        
        {/* Author Info */}
        <div className="mt-8 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold mb-4">About This Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Author</h4>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
                  {template.author.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{template.author.name}</div>
                  <div className="text-sm text-gray-600">
                    {template.author.templateCount} templates
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{template.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">License:</span>
                  <span className="font-medium">{template.license}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">
                    {template.price === 'free' ? 'Free' : `$${template.price}`}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
