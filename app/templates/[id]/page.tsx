'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Star, 
  Download, 
  Eye, 
  Users, 
  Clock, 
  ChevronRight,
  Code,
  Palette,
  Layers,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import TemplateAnalyticsTracker from '@/components/templates/TemplateAnalyticsTracker'
import ReviewForm from '@/components/templates/ReviewForm'

interface Template {
  id: string
  name: string
  description: string
  longDescription: string
  category: string
  difficulty: string
  rating: number
  reviewCount: number
  usageCount: number
  viewCount: number
  price: 'free' | number
  previewImage: string
  author: {
    name: string
    avatar: string
    verified: boolean
  }
  estimatedBuildTime: string
  dependencies: string[]
  features: string[]
  tags: string[]
  createdAt: string
}

export default function TemplateDetailsPage() {
  const params = useParams()
  const templateId = params.id as string
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showReviews, setShowReviews] = useState(false)

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  const fetchTemplate = async () => {
    setLoading(true)
    try {
      // Mock data for now - in production, fetch from API
      const mockTemplate: Template = {
        id: templateId,
        name: 'Modern Dashboard Pro',
        description: 'A sophisticated dashboard template with analytics and AI features',
        longDescription: 'This professional dashboard template includes everything you need to build a modern analytics dashboard. Features include interactive charts, real-time data visualization, user management, and AI-powered insights. Built with React, TypeScript, and Tailwind CSS.',
        category: 'dashboard',
        difficulty: 'intermediate',
        rating: 4.7,
        reviewCount: 124,
        usageCount: 568,
        viewCount: 2450,
        price: 49.99,
        previewImage: '',
        author: {
          name: 'Design Studio',
          avatar: '',
          verified: true
        },
        estimatedBuildTime: '3-4 hours',
        dependencies: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
        features: [
          'Interactive Charts',
          'Dark/Light Mode',
          'Responsive Design',
          'AI Insights',
          'Real-time Updates',
          'User Management'
        ],
        tags: ['dashboard', 'analytics', 'admin', 'business', 'saas'],
        createdAt: '2024-01-01'
      }
      
      setTemplate(mockTemplate)
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = async () => {
    try {
      // Track template usage
      const response = await fetch('/api/analytics/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trackUse',
          templateId,
          userId: 'current-user-id', // In production, use actual user ID
          projectId: 'new-project'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Redirect to builder with template
        window.location.href = `/builder/new?template=${templateId}`
      }
    } catch (error) {
      console.error('Error using template:', error)
    }
  }

  const handleDownload = async () => {
    try {
      await fetch('/api/analytics/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trackDownload',
          templateId,
          userId: 'current-user-id'
        })
      })

      // Trigger download
      window.location.href = `/api/templates/download/${templateId}`
    } catch (error) {
      console.error('Error downloading template:', error)
    }
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
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Eye className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Template not found</h3>
          <p className="text-gray-600">The template you're looking for doesn't exist</p>
          <Button className="mt-4" onClick={() => window.location.href = '/templates'}>
            Browse Templates
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Analytics Tracker */}
      <TemplateAnalyticsTracker templateId={templateId} trackView />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center text-sm text-gray-300 mb-4">
              <a href="/templates" className="hover:text-white">Templates</a>
              <ChevronRight className="w-4 h-4 mx-2" />
              <a href={`/templates?category=${template.category}`} className="hover:text-white capitalize">
                {template.category}
              </a>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span>{template.name}</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{template.name}</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">{template.description}</p>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(template.rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{template.rating.toFixed(1)}</span>
                <span className="text-gray-400 ml-2">({template.reviewCount} reviews)</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <Users className="w-5 h-5 mr-2" />
                <span>{template.usageCount.toLocaleString()} uses</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <Eye className="w-5 h-5 mr-2" />
                <span>{template.viewCount.toLocaleString()} views</span>
              </div>
              
              <Badge className={`
                ${template.difficulty === 'beginner' ? 'bg-green-500' : 
                  template.difficulty === 'intermediate' ? 'bg-yellow-500' : 
                  'bg-red-500'} text-white
              `}>
                {template.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Preview Section */}
            <div className="bg-white rounded-xl border overflow-hidden mb-8">
              <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                  <Layers className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600">Template Preview</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-8">
              <div className="flex space-x-8">
                {['overview', 'features', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    className={`pb-4 font-medium ${
                      activeTab === tab
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="mb-12">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Overview</h3>
                  <p className="text-gray-700 leading-relaxed">{template.longDescription}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <Code className="w-6 h-6 text-purple-600 mr-3" />
                        <h4 className="font-semibold">Dependencies</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.dependencies.map((dep, idx) => (
                          <Badge key={idx} variant="outline">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <Clock className="w-6 h-6 text-purple-600 mr-3" />
                        <h4 className="font-semibold">Build Time</h4>
                      </div>
                      <p className="text-gray-700">{template.estimatedBuildTime}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {template.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <Zap className="w-5 h-5 text-green-600 mr-3" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="font-semibold mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">Reviews ({template.reviewCount})</h3>
                    <Button onClick={() => setShowReviews(!showReviews)}>
                      {showReviews ? 'Hide Review Form' : 'Write a Review'}
                    </Button>
                  </div>
                  
                  {showReviews && (
                    <div className="mb-8">
                      <ReviewForm 
                        templateId={templateId}
                        onReviewSubmitted={() => {
                          setShowReviews(false)
                          // Refresh reviews
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Reviews will be loaded here */}
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Reviews will appear here</p>
                    <p className="text-sm mt-2">Be the first to review this template!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-8 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-xl border p-6">
                <div className="text-center mb-6">
                  {template.price === 'free' ? (
                    <div className="text-4xl font-bold text-green-600">Free</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">${template.price}</div>
                      <div className="text-gray-600">One-time purchase</div>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Button 
                    className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={handleUseTemplate}
                  >
                    <Code className="w-5 h-5 mr-2" />
                    Use Template in Builder
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full py-6 text-lg"
                    onClick={handleDownload}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Source Code
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                  <div className="flex justify-between mb-2">
                    <span>License:</span>
                    <span className="font-medium">MIT</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Updates:</span>
                    <span className="font-medium">1 year included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Support:</span>
                    <span className="font-medium">Community</span>
                  </div>
                </div>
              </div>

              {/* Author Card */}
              <div className="bg-white rounded-xl border p-6">
                <h4 className="font-semibold mb-4">Author</h4>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-4">
                    {template.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {template.author.name}
                      {template.author.verified && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800">Verified</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Template Creator</div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-xl border p-6">
                <h4 className="font-semibold mb-4">Template Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium">{template.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <span className="font-medium capitalize">{template.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">2 weeks ago</span>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className="bg-white rounded-xl border p-6">
                <h4 className="font-semibold mb-4">Share This Template</h4>
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" className="flex-1">
                    LinkedIn
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
