'use client'

import { useState } from 'react'
import { 
  Play, CheckCircle, XCircle, AlertTriangle,
  Code, Bug, Shield, Zap, RefreshCw,
  FileCode, Users, Terminal, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface TestResult {
  id: string
  name: string
  type: 'unit' | 'integration' | 'e2e' | 'performance'
  status: 'passed' | 'failed' | 'running' | 'pending'
  duration: number
  details?: string
}

export default function TestingDashboard() {
  const [tests, setTests] = useState<TestResult[]>([
    { id: '1', name: 'Button Component', type: 'unit', status: 'passed', duration: 120 },
    { id: '2', name: 'Authentication Flow', type: 'integration', status: 'passed', duration: 450 },
    { id: '3', name: 'Drag & Drop', type: 'e2e', status: 'running', duration: 1200 },
    { id: '4', name: 'Export System', type: 'integration', status: 'failed', duration: 800, details: 'File generation timeout' },
    { id: '5', name: 'Mobile Responsive', type: 'unit', status: 'pending', duration: 0 },
    { id: '6', name: 'API Endpoints', type: 'integration', status: 'passed', duration: 320 },
    { id: '7', name: 'Performance Load', type: 'performance', status: 'passed', duration: 1500 },
    { id: '8', name: 'Error Handling', type: 'unit', status: 'pending', duration: 0 },
  ])

  const [isRunningAll, setIsRunningAll] = useState(false)
  const [coverage, setCoverage] = useState(85)

  const runAllTests = () => {
    setIsRunningAll(true)
    setTests(prev => prev.map(test => ({ ...test, status: 'running' })))

    // Simulate test execution
    setTimeout(() => {
      setTests(prev => prev.map((test, index) => ({
        ...test,
        status: index % 5 === 0 ? 'failed' : 'passed',
        duration: test.duration + Math.random() * 100,
      })))
      setIsRunningAll(false)
      setCoverage(prev => Math.min(100, prev + 5))
    }, 3000)
  }

  const runSingleTest = (id: string) => {
    setTests(prev => prev.map(test => 
      test.id === id ? { ...test, status: 'running' } : test
    ))

    setTimeout(() => {
      setTests(prev => prev.map(test => 
        test.id === id ? { ...test, status: 'passed', duration: test.duration + 50 } : test
      ))
    }, 1000)
  }

  const getTestStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getTestTypeColor = (type: TestResult['type']) => {
    switch (type) {
      case 'unit': return 'bg-blue-100 text-blue-800'
      case 'integration': return 'bg-green-100 text-green-800'
      case 'e2e': return 'bg-purple-100 text-purple-800'
      case 'performance': return 'bg-orange-100 text-orange-800'
    }
  }

  const passedTests = tests.filter(t => t.status === 'passed').length
  const failedTests = tests.filter(t => t.status === 'failed').length
  const totalDuration = tests.reduce((sum, test) => sum + test.duration, 0) / 1000

  const testCategories = [
    { type: 'unit', count: tests.filter(t => t.type === 'unit').length, color: 'bg-blue-500' },
    { type: 'integration', count: tests.filter(t => t.type === 'integration').length, color: 'bg-green-500' },
    { type: 'e2e', count: tests.filter(t => t.type === 'e2e').length, color: 'bg-purple-500' },
    { type: 'performance', count: tests.filter(t => t.type === 'performance').length, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Test Summary */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Suite Dashboard</CardTitle>
              <CardDescription>Automated testing for AI Meta Factory</CardDescription>
            </div>
            <Button onClick={runAllTests} disabled={isRunningAll} size="lg">
              {isRunningAll ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{passedTests}</div>
                  <div className="text-sm text-muted-foreground">Passed Tests</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{failedTests}</div>
                  <div className="text-sm text-muted-foreground">Failed Tests</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{tests.length}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{totalDuration.toFixed(1)}s</div>
                  <div className="text-sm text-muted-foreground">Total Duration</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Coverage */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="font-medium">Code Coverage</span>
              </div>
              <span className="font-bold">{coverage}%</span>
            </div>
            <Progress value={coverage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>Target: 90%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Test Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {testCategories.map((category) => (
              <div key={category.type} className="text-center p-3 border rounded-lg">
                <div className={`h-2 w-full ${category.color} rounded mb-2`} />
                <div className="text-lg font-bold">{category.count}</div>
                <div className="text-xs text-muted-foreground capitalize">{category.type} Tests</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Detailed test execution results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Test Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id} className="border-b hover:bg-accent/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getTestStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      {test.details && (
                        <div className="text-xs text-red-600 mt-1">{test.details}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge className={getTestTypeColor(test.type)}>
                        {test.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        test.status === 'passed' 
                          ? 'bg-green-100 text-green-800'
                          : test.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : test.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{(test.duration / 1000).toFixed(2)}s</div>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSingleTest(test.id)}
                        disabled={test.status === 'running'}
                      >
                        {test.status === 'running' ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Testing Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Debug Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Terminal className="w-4 h-4 mr-2" />
                Console Logger
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileCode className="w-4 h-4 mr-2" />
                Component Inspector
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                User Session Replay
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance Profiler
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">XSS Protection</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CSRF Protection</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SQL Injection</span>
                <Badge className="bg-green-100 text-green-800">Protected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Encryption</span>
                <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
              </div>
              <Button className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Run Security Audit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Recommendations */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold mb-2">Testing Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Increase unit test coverage for builder components
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Add integration tests for export system
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Implement end-to-end tests for user flows
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Add performance testing for large projects
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
