'use client'

import { 
  Star, 
  Download, 
  Eye, 
  Users, 
  Clock, 
  Zap,
  Shield,
  CheckCircle,
  ExternalLink,
  Heart,
  Bookmark,
  ShoppingBag,
  Briefcase,
  Cloud,
  FileText,
  Rocket,
  Smartphone
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface TemplateCardProps {
  template: {
    id: string
    name: string
    description: string
    category: string
    difficulty: string
    rating: number
    reviewCount: number
    downloadCount: number
    usageCount: number
    price: 'free' | number
    previewImage: string
    author: {
      name: string
      avatar: string
      verified: boolean
    }
    featured: boolean
    trending: boolean
    createdAt: string
    tags: string[]
  }
  viewMode: 'grid' | 'list'
  onUse: () => void
}

export default function TemplateCard({ template, viewMode, onUse }: TemplateCardProps) {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dashboard': return 'bg-blue-100 text-blue-800'
      case 'ecommerce': return 'bg-green-100 text-green-800'
      case 'portfolio': return 'bg-purple-100 text-purple-800'
      case 'saas': return 'bg-indigo-100 text-indigo-800'
      case 'blog': return 'bg-pink-100 text-pink-800'
      case 'landing': return 'bg-orange-100 text-orange-800'
      case 'mobile': return 'bg-teal-100 text-teal-800'
      case 'admin': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dashboard': return <Zap className="w-6 h-6" />
      case 'ecommerce': return <ShoppingBag className="w-6 h-6" />
      case 'portfolio': return <Briefcase className="w-6 h-6" />
      case 'saas': return <Cloud className="w-6 h-6" />
      case 'blog': return <FileText className="w-6 h-6" />
      case 'landing': return <Rocket className="w-6 h-6" />
      case 'mobile': return <Smartphone className="w-6 h-6" />
      case 'admin': return <Shield className="w-6 h-6" />
      default: return <Zap className="w-6 h-6" />
    }
  }

  const handleLike = async () => {
    try {
      await fetch(`/api/templates/${template.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'like',
          userId: 'current-user-id' // Replace with actual user ID
        })
      })
      setLiked(!liked)
      toast.success(!liked ? 'Template liked!' : 'Like removed')
    } catch (error) {
      toast.error('Failed to like template')
    }
  }

  const handleBookmark = async () => {
    try {
      await fetch(`/api/templates/${template.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'bookmark',
          userId: 'current-user-id' // Replace with actual user ID
        })
      })
      setBookmarked(!bookmarked)
      toast.success(!bookmarked ? 'Template bookmarked!' : 'Bookmark removed')
    } catch (error) {
      toast.error('Failed to bookmark template')
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row">
          {/* Preview Image */}
          <div className="md:w-1/3">
            <div className="h-48 md:h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-lg mx-auto mb-3 flex items-center justify-center">
                  {getCategoryIcon(template.category)}
                </div>
                <span className="font-medium">{template.name}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{template.name}</h3>
                  {template.featured && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Featured
                    </Badge>
                  )}
                  {template.trending && (
                    <Badge className="bg-gradient-to-r from-orange-600 to-red-600">
                      Trending
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{template.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  className={liked ? 'text-red-500 hover:text-red-600' : ''}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmark}
                  className={bookmarked ? 'text-blue-500 hover:text-blue-600' : ''}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Stats and Tags */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-medium">{template.rating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({template.reviewCount})</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Download className="w-4 h-4 mr-1" />
                {template.downloadCount}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                {template.usageCount}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(template.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getCategoryColor(template.category)}>
                {template.category}
              </Badge>
              <Badge className={getDifficultyColor(template.difficulty)}>
                {template.difficulty}
              </Badge>
              {template.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Author and Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <span className="text-sm font-medium">
                    {template.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium">{template.author.name}</div>
                  {template.author.verified && (
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {template.price === 'free' ? (
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    Free
                  </Badge>
                ) : (
                  <div className="text-2xl font-bold">${template.price}</div>
                )}
                <Button onClick={onUse} className="ml-2">
                  Use Template
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid View
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getCategoryColor(template.category)}>
                {template.category}
              </Badge>
              {template.featured && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-lg line-clamp-1">{template.name}</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${liked ? 'text-red-500 fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {/* Preview Image */}
        <div className="h-40 mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
          <div className="text-center z-10">
            <div className="w-12 h-12 bg-white/90 rounded-lg shadow-lg mx-auto mb-2 flex items-center justify-center">
              {getCategoryIcon(template.category)}
            </div>
            <span className="font-medium text-sm">Preview</span>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Quick Preview
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="font-bold">{template.rating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{template.downloadCount}</div>
            <div className="text-xs text-gray-500">Downloads</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{template.usageCount}</div>
            <div className="text-xs text-gray-500">Uses</div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Difficulty</span>
            <span className="font-medium">{template.difficulty}</span>
          </div>
          <Progress 
            value={
              template.difficulty === 'beginner' ? 25 :
              template.difficulty === 'intermediate' ? 50 : 75
            } 
            className="h-2"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs font-medium">
                {template.author.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium">{template.author.name}</span>
            {template.author.verified && (
              <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {template.price === 'free' ? (
              <Badge className="bg-green-100 text-green-800">Free</Badge>
            ) : (
              <div className="text-lg font-bold">${template.price}</div>
            )}
            <Button size="sm" onClick={onUse}>
              Use
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
