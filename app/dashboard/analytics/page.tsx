'use client'

import { useState, useEffect } from 'react'
import { 
  Eye, 
  Download, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign,
  BarChart3,
  Calendar,
  Filter,
  ThumbsUp,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MetricsCard from '@/components/analytics/MetricsCard'
import UsageChart from '@/components/analytics/UsageChart'

interface AnalyticsData {
  overview: {
    totalViews: number
    totalUses: number
    totalDownloads: number
    averageRating: number
    reviewCount: number
    conversionRate: string
    revenue: string
  }
  trends: {
    dailyUsage: Array<{
      date: string
      views: number
      uses: number
      downloads: number
    }>
    retentionRate: number
  }
  reviews: {
    total: number
    average: number
    recent: Array<{
      id: string
      userName: string
      rating: number
      comment: string
      pros: string[]
      cons: string[]
      createdAt: string
      helpfulCount: number
    }>
  }
  topTemplates: Array<{
    id: string
    name: string
    uses: number
    rating: number
    category: string
  }>
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [templateFilter, setTemplateFilter] = useState('all')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, templateFilter])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // In production, this would fetch from your API
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        overview: {
          totalViews: 12450,
          totalUses: 3421,
          totalDownloads: 2893,
          averageRating: 4.7,
          reviewCount: 243,
          conversionRate: '27.5%',
          revenue: '1,245.50'
        },
        trends: {
          dailyUsage: generateMockDailyData(timeRange),
          retentionRate: 68.5
        },
        reviews: {
          total: 243,
          average: 4.7,
          recent: [
            {
              id: '1',
              userName: 'Alex Johnson',
              rating: 5,
              comment: 'This template saved me hours of work! The code is clean and well-documented.',
              pros: ['Excellent documentation', 'Responsive design', 'Easy to customize'],
              cons: ['Could use more examples'],
              createdAt: '2024-01-15',
              helpfulCount: 24
            },
            {
              id: '2',
              userName: 'Sam Wilson',
              rating: 4,
              comment: 'Very useful for my SaaS project. Some components needed optimization but overall great.',
              pros: ['Modern design', 'Good performance'],
              cons: ['Some dependencies are outdated'],
              createdAt: '2024-01-14',
              helpfulCount: 18
            },
            {
              id: '3',
              userName: 'Taylor Chen',
              rating: 5,
              comment: 'Perfect for our dashboard needs. The AI features integration was seamless.',
              pros: ['AI integration', 'Clean code structure'],
              cons: ['Learning curve for beginners'],
              createdAt: '2024-01-13',
              helpfulCount: 12
            }
          ]
        },
        topTemplates: [
          { id: '1', name: 'Modern Dashboard', uses: 1240, rating: 4.8, category: 'dashboard' },
          { id: '2', name: 'E-commerce Store', uses: 980, rating: 4.6, category: 'ecommerce' },
          { id: '3', name: 'Portfolio Website', uses: 756, rating: 4.9, category: 'portfolio' },
          { id: '4', name: 'SAAS Application', uses: 542, rating: 4.7, category: 'saas' },
          { id: '5', name: 'Mobile App UI', uses: 421, rating: 4.5, category: 'mobile' }
        ]
      }
      
      setAnalytics(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockDailyData = (range: string) => {
    const days = range === '7d' ? 7 : 30
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 500) + 100,
        uses: Math.floor(Math.random() * 150) + 20,
        downloads: Math.floor(Math.random() * 120) + 15
      })
    }
    
    return data
  }

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '24h': return 'Last 24 Hours'
      case '7d': return 'Last 7 Days'
      case '30d': return 'Last 30 Days'
      case '90d': return 'Last 90 Days'
      default: return 'Last 30 Days'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Template Analytics</h1>
              <p className="text-gray-600 mt-2">
                Track performance, user engagement, and revenue insights
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue>{getTimeRangeLabel(timeRange)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <Select value={templateFilter} onValueChange={setTemplateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue>All Templates</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Templates</SelectItem>
                    <SelectItem value="dashboard">Dashboards</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="portfolio">Portfolios</SelectItem>
                    <SelectItem value="saas">SAAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricsCard
                  title="Total Views"
                  value={analytics.overview.totalViews}
                  change={12}
                  icon={Eye}
                  color="text-blue-600"
                />
                <MetricsCard
                  title="Template Uses"
                  value={analytics.overview.totalUses}
                  change={8}
                  icon={TrendingUp}
                  color="text-green-600"
                />
                <MetricsCard
                  title="Average Rating"
                  value={analytics.overview.averageRating}
                  change={3}
                  icon={Star}
                  color="text-yellow-600"
                />
                <MetricsCard
                  title="Total Revenue"
                  value={analytics.overview.revenue}
                  change={15}
                  icon={DollarSign}
                  color="text-purple-600"
                  format="currency"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Usage Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Usage Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UsageChart data={analytics.trends.dailyUsage} />
                  </CardContent>
                </Card>

                {/* Top Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topTemplates.map((template, index) => (
                        <div 
                          key={template.id} 
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-gray-600">{template.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{template.uses.toLocaleString()}</div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              {template.rating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {analytics.overview.conversionRate}
                      </div>
                      <p className="text-sm text-gray-600">
                        Views to Uses conversion
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">User Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {analytics.trends.retentionRate.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">
                        Users who return to use templates
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Total Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {analytics.overview.reviewCount}
                      </div>
                      <p className="text-sm text-gray-600">
                        User feedback received
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>User Reviews</CardTitle>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold">
                        {analytics.reviews.average.toFixed(1)}
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(analytics.reviews.average)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600">
                        ({analytics.reviews.total} reviews)
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analytics.reviews.recent.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold">{review.userName}</div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <div className="flex mr-3">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>{review.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {review.helpfulCount} found helpful
                          </div>
                        </div>
                        
                        <p className="text-gray-800 mb-3">{review.comment}</p>
                        
                        {review.pros.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-green-600 mr-2">Pros:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {review.pros.map((pro, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                                >
                                  {pro}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {review.cons.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-red-600 mr-2">Cons:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {review.cons.map((con, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full"
                                >
                                  {con}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Template Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Template</th>
                          <th className="text-left py-3 px-4 font-semibold">Category</th>
                          <th className="text-left py-3 px-4 font-semibold">Uses</th>
                          <th className="text-left py-3 px-4 font-semibold">Views</th>
                          <th className="text-left py-3 px-4 font-semibold">Rating</th>
                          <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topTemplates.map((template) => (
                          <tr key={template.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium">{template.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                {template.category}
                              </span>
                            </td>
                            <td className="py-3 px-4">{template.uses.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              {Math.round(template.uses * 3.64).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                {template.rating.toFixed(1)}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              ${(template.uses * 0.99).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
                        <div className="text-3xl font-bold mb-2">
                          ${analytics.overview.revenue}
                        </div>
                        <div className="text-sm opacity-90">Total Revenue</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-lg">
                        <div className="text-3xl font-bold mb-2">24</div>
                        <div className="text-sm opacity-90">Premium Templates</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg">
                        <div className="text-3xl font-bold mb-2">68.5%</div>
                        <div className="text-sm opacity-90">Conversion Rate</div>
                      </div>
                    </div>
                    
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Revenue chart visualization would appear here</p>
                      <p className="text-sm mt-2">
                        Showing earnings from template sales and premium features
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No analytics data</h3>
            <p className="text-gray-600">Analytics will appear once templates are used</p>
          </div>
        )}
      </div>
    </div>
  )
}
