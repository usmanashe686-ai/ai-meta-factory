'use client'

import { useState, useEffect } from 'react'
import {
  Users, Eye, Download, MousePointerClick,
  TrendingUp, Calendar, Globe, Smartphone,
  BarChart3, PieChart, LineChart, Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
  visitors: number
  pageViews: number
  exports: number
  clicks: number
  bounceRate: number
  avgSession: number
  topCountries: Array<{ country: string; users: number }>
  devices: Array<{ device: string; percentage: number }>
  topPages: Array<{ page: string; views: number }>
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [data, setData] = useState<AnalyticsData>({
    visitors: 1245,
    pageViews: 5678,
    exports: 89,
    clicks: 3456,
    bounceRate: 32,
    avgSession: 4.2,
    topCountries: [
      { country: 'United States', users: 456 },
      { country: 'India', users: 234 },
      { country: 'Germany', users: 189 },
      { country: 'UK', users: 167 },
      { country: 'Canada', users: 98 },
    ],
    devices: [
      { device: 'Mobile', percentage: 58 },
      { device: 'Desktop', percentage: 35 },
      { device: 'Tablet', percentage: 7 },
    ],
    topPages: [
      { page: '/builder', views: 1234 },
      { page: '/export', views: 876 },
      { page: '/dashboard', views: 654 },
      { page: '/auth/login', views: 543 },
      { page: '/', views: 432 },
    ],
  })

  useEffect(() => {
    // Simulate data updates
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        visitors: prev.visitors + Math.floor(Math.random() * 10),
        pageViews: prev.pageViews + Math.floor(Math.random() * 50),
        clicks: prev.clicks + Math.floor(Math.random() * 20),
      }))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      label: 'Total Visitors',
      value: data.visitors.toLocaleString(),
      change: '+12.5%',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Page Views',
      value: data.pageViews.toLocaleString(),
      change: '+8.3%',
      icon: <Eye className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Projects Exported',
      value: data.exports.toLocaleString(),
      change: '+24.1%',
      icon: <Download className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Total Clicks',
      value: data.clicks.toLocaleString(),
      change: '+5.7%',
      icon: <MousePointerClick className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track usage and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-32 p-2 border rounded-lg text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                    <span className="text-sm text-muted-foreground">from last period</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Bounce Rate</span>
                  <span className="font-bold">{data.bounceRate}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${data.bounceRate}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lower is better
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Average Session Duration</span>
                  <span className="font-bold">{data.avgSession.toFixed(1)} min</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(data.avgSession / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher is better
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Device Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.devices.map((device, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {device.device === 'Mobile' && <Smartphone className="w-4 h-4" />}
                      {device.device === 'Desktop' && <Globe className="w-4 h-4" />}
                      {device.device === 'Tablet' && <span className="w-4 h-4">📱</span>}
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <span className="font-bold">{device.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCountries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold">🌍</span>
                    </div>
                    <div>
                      <div className="font-medium">{country.country}</div>
                      <div className="text-sm text-muted-foreground">{country.users} users</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{((country.users / data.visitors) * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">of total</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    } flex items-center justify-center`}>
                      <span className="text-xs font-bold">#{index + 1}</span>
                    </div>
                    <div className="truncate">
                      <div className="font-medium truncate">{page.page}</div>
                      <div className="text-sm text-muted-foreground">{page.views.toLocaleString()} views</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{((page.views / data.pageViews) * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">of total</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Traffic Overview
          </CardTitle>
          <CardDescription>Visitors and page views over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-blue-500/10 to-primary/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-lg font-medium">Traffic Analytics</p>
              <p className="text-sm text-muted-foreground mt-1">
                Chart visualization would appear here with real data
              </p>
              <Button className="mt-4" variant="outline">
                <PieChart className="w-4 h-4 mr-2" />
                View Detailed Charts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
