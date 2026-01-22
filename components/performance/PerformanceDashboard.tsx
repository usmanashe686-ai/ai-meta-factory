'use client'

import { useState, useEffect } from 'react'
import {
  Zap, Gauge, Clock, Cpu,
  Battery, MemoryStick, Network,
  TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  memoryUsage: number
  networkRequests: number
  score: number
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    networkRequests: 0,
    score: 0,
  })

  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Simulate performance monitoring
      const simulateMetrics = () => {
        setMetrics({
          loadTime: Math.random() * 1000 + 500,
          firstContentfulPaint: Math.random() * 800 + 200,
          largestContentfulPaint: Math.random() * 1200 + 400,
          cumulativeLayoutShift: Math.random() * 0.1,
          firstInputDelay: Math.random() * 50 + 10,
          memoryUsage: Math.random() * 50 + 10,
          networkRequests: Math.floor(Math.random() * 20) + 5,
          score: Math.floor(Math.random() * 30) + 70,
        })
      }

      simulateMetrics()
      const interval = setInterval(simulateMetrics, 5000)

      return () => clearInterval(interval)
    }
  }, [])

  const runPerformanceTest = () => {
    setIsMonitoring(true)
    // Simulate performance test
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        score: Math.min(100, prev.score + 5),
        loadTime: Math.max(200, prev.loadTime - 50),
      }))
      setIsMonitoring(false)
    }, 2000)
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceStatus = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  const optimizationTips = [
    {
      id: 1,
      title: 'Image Optimization',
      description: 'Use next/image for automatic optimization',
      impact: 'High',
      status: 'implemented',
    },
    {
      id: 2,
      title: 'Code Splitting',
      description: 'Dynamic imports for faster initial load',
      impact: 'High',
      status: 'implemented',
    },
    {
      id: 3,
      title: 'Font Optimization',
      description: 'Use next/font for automatic font optimization',
      impact: 'Medium',
      status: 'pending',
    },
    {
      id: 4,
      title: 'Bundle Analysis',
      description: 'Analyze bundle size and remove duplicates',
      impact: 'Medium',
      status: 'pending',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Performance Score Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Score</CardTitle>
              <CardDescription>Overall application performance</CardDescription>
            </div>
            <div className={`text-3xl font-bold ${getPerformanceColor(metrics.score)}`}>
              {metrics.score}
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Performance Score</span>
                <span>{getPerformanceStatus(metrics.score)}</span>
              </div>
              <Progress value={metrics.score} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-bold">{metrics.loadTime.toFixed(0)}ms</span>
                </div>
                <div className="text-xs text-muted-foreground">Load Time</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-green-600" />
                  <span className="font-bold">{metrics.firstContentfulPaint.toFixed(0)}ms</span>
                </div>
                <div className="text-xs text-muted-foreground">FCP</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MemoryStick className="w-4 h-4 text-purple-600" />
                  <span className="font-bold">{metrics.memoryUsage.toFixed(1)}MB</span>
                </div>
                <div className="text-xs text-muted-foreground">Memory</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-orange-600" />
                  <span className="font-bold">{metrics.networkRequests}</span>
                </div>
                <div className="text-xs text-muted-foreground">Requests</div>
              </div>
            </div>

            <Button
              onClick={runPerformanceTest}
              disabled={isMonitoring}
              className="w-full"
            >
              {isMonitoring ? (
                <>
                  <div className="animate-spin mr-2">⟳</div>
                  Running Tests...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Performance Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>Improve your app performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationTips.map((tip) => (
              <div key={tip.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tip.status === 'implemented'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {tip.status === 'implemented' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    tip.impact === 'High'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {tip.impact} Impact
                  </span>
                  <Button size="sm" variant={tip.status === 'implemented' ? 'outline' : 'default'}>
                    {tip.status === 'implemented' ? 'Optimized' : 'Optimize'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Metrics</CardTitle>
          <CardDescription>Live performance monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <span className="text-sm">{Math.floor(Math.random() * 30) + 10}%</span>
              </div>
              <Progress value={Math.random() * 30 + 10} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-4 h-4" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <span className="text-sm">{metrics.memoryUsage.toFixed(1)} MB</span>
              </div>
              <Progress value={metrics.memoryUsage} max={100} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  <span className="text-sm font-medium">Battery Impact</span>
                </div>
                <span className="text-sm">Low</span>
              </div>
              <Progress value={20} className="h-2 bg-green-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  <span className="text-sm font-medium">Network Speed</span>
                </div>
                <span className="text-sm">4G</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>Track improvements over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Last 24 Hours</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
            </div>
            <div className="h-32 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">🚀</div>
                <p className="text-sm text-muted-foreground">Performance trending upward</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">0.8s</div>
                <div className="text-xs text-muted-foreground">Avg Load Time</div>
              </div>
              <div>
                <div className="text-lg font-bold">94%</div>
                <div className="text-xs text-muted-foreground">Cache Hit Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold">A+</div>
                <div className="text-xs text-muted-foreground">Security Grade</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
