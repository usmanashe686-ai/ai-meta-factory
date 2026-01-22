'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Shield, 
  TrendingUp,
  Bug,
  RefreshCw,
  Code,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { AICodeReviewer, CodeIssue, CodeReviewResult, CodeFix } from '@/lib/ai/code-analysis/reviewer'

interface CodeReviewPanelProps {
  code: string
  language: string
  onFixApplied?: (fixedCode: string, issueId: string) => void
  className?: string
}

export default function CodeReviewPanel({ 
  code, 
  language, 
  onFixApplied,
  className = ''
}: CodeReviewPanelProps) {
  const [reviewing, setReviewing] = useState(false)
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<CodeIssue | null>(null)
  const [fixing, setFixing] = useState(false)
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  
  const reviewer = new AICodeReviewer()

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error('Please add some code to review')
      return
    }
    
    setReviewing(true)
    setReviewResult(null)
    setSelectedIssue(null)
    
    try {
      toast.loading('AI is analyzing your code...')
      const result = await reviewer.reviewCode(code, language)
      setReviewResult(result)
      
      if (result.issues.length > 0) {
        toast.dismiss()
        toast.success(`Found ${result.issues.length} issues with score ${result.score}/100`)
      } else {
        toast.dismiss()
        toast.success('Great! No issues found!')
      }
      
    } catch (error: any) {
      console.error('Review failed:', error)
      toast.error(`Review failed: ${error.message}`)
    } finally {
      setReviewing(false)
    }
  }

  const handleFixIssue = async (issue: CodeIssue) => {
    setSelectedIssue(issue)
    setFixing(true)
    
    try {
      toast.loading('Generating fix...')
      const fix = await reviewer.generateFix(issue, code)
      
      if (fix.fixed !== code) {
        onFixApplied?.(fix.fixed, issue.id)
        setAppliedFixes(prev => new Set([...prev, issue.id]))
        toast.success('Fix applied!')
      } else {
        toast.error('Could not generate a fix for this issue')
      }
    } catch (error: any) {
      console.error('Fix failed:', error)
      toast.error(`Fix failed: ${error.message}`)
    } finally {
      setFixing(false)
    }
  }

  const toggleIssueExpansion = (issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev)
      if (newSet.has(issueId)) {
        newSet.delete(issueId)
      } else {
        newSet.add(issueId)
      }
      return newSet
    })
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Code copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-blue-500 text-white'
      case 'info': return 'bg-gray-500 text-white'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200'
      case 'high': return 'bg-orange-50 border-orange-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'low': return 'bg-blue-50 border-blue-200'
      case 'info': return 'bg-gray-50 border-gray-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />
      case 'performance': return <Zap className="w-4 h-4" />
      case 'accessibility': return <TrendingUp className="w-4 h-4" />
      case 'bug': return <Bug className="w-4 h-4" />
      case 'critical': return <AlertCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    if (score >= 50) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const calculateProgress = () => {
    if (!reviewResult) return 0
    return reviewResult.score
  }

  const getSortedIssues = () => {
    if (!reviewResult) return []
    
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return [...reviewResult.issues].sort((a, b) => {
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }

  useEffect(() => {
    // Auto-review when code changes (debounced)
    const timer = setTimeout(() => {
      if (code && code.length > 50 && code.length < 5000) {
        // handleReview() // Uncomment for auto-review
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [code])

  return (
    <Card className={`w-full h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            AI Code Review
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyCode}
              className="flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewing || !code.trim()}
              size="sm"
              className="flex items-center gap-1"
            >
              {reviewing ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Review Code
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          AI-powered analysis for security, performance, and best practices
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {reviewing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-lg font-medium mb-2">AI is reviewing your code</p>
            <p className="text-gray-600 text-center max-w-sm">
              Analyzing for security issues, performance bottlenecks, and best practices...
            </p>
            <div className="mt-6 w-full max-w-xs">
              <Progress value={33} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Analyzing</span>
                <span>Processing</span>
                <span>Reporting</span>
              </div>
            </div>
          </div>
        ) : reviewResult ? (
          <>
            {/* Score Summary */}
            <div className={`p-4 rounded-lg ${getScoreBgColor(reviewResult.score)}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <span className={getScoreColor(reviewResult.score)}>
                      {reviewResult.score}/100
                    </span>
                    <Badge className={getSeverityColor(
                      reviewResult.score >= 90 ? 'info' :
                      reviewResult.score >= 70 ? 'low' :
                      reviewResult.score >= 50 ? 'medium' : 'high'
                    )}>
                      {reviewResult.score >= 90 ? 'Excellent' : 
                       reviewResult.score >= 70 ? 'Good' : 
                       reviewResult.score >= 50 ? 'Needs Work' : 'Poor'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Code Quality Score
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Estimated Improvement</div>
                  <div className="font-medium">{reviewResult.estimatedImprovement}</div>
                </div>
              </div>
              
              <Progress value={calculateProgress()} className="h-2" />
              
              {/* Issues Summary */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {Object.entries(reviewResult.summary).map(([severity, count]) => (
                  <div key={severity} className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(
                      severity === 'critical' ? 30 :
                      severity === 'high' ? 50 :
                      severity === 'medium' ? 70 : 90
                    )}`}>
                      {count}
                    </div>
                    <div className="text-xs uppercase text-gray-600">
                      {severity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="issues">
                  Issues ({reviewResult.issues.length})
                </TabsTrigger>
                <TabsTrigger value="suggestions">
                  Suggestions ({reviewResult.suggestions.length})
                </TabsTrigger>
                <TabsTrigger value="metrics">
                  Metrics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="issues" className="space-y-3 mt-4">
                {getSortedIssues().length > 0 ? (
                  getSortedIssues().map((issue) => (
                    <div 
                      key={issue.id}
                      className={`border rounded-lg p-3 ${getSeverityBgColor(issue.severity)} ${
                        appliedFixes.has(issue.id) ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded ${getSeverityColor(issue.severity)}`}>
                            {getIssueIcon(issue.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{issue.message}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSeverityColor(issue.severity)} border-current`}
                              >
                                {issue.severity}
                              </Badge>
                              {appliedFixes.has(issue.id) && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Fixed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{issue.suggestion}</p>
                            
                            {expandedIssues.has(issue.id) && (
                              <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <span className="text-gray-500">Type:</span>
                                    <Badge variant="outline" className="ml-2">
                                      {issue.type}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Confidence:</span>
                                    <span className="ml-2">
                                      {Math.round(issue.confidence * 100)}%
                                    </span>
                                  </div>
                                </div>
                                {issue.line && (
                                  <div className="text-gray-500">
                                    Location: Line {issue.line}
                                  </div>
                                )}
                                <div className="text-gray-500 mt-1">
                                  Rule: {issue.ruleId || 'N/A'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 ml-2">
                          <Button
                            size="sm"
                            variant={appliedFixes.has(issue.id) ? "outline" : "default"}
                            onClick={() => handleFixIssue(issue)}
                            disabled={fixing || appliedFixes.has(issue.id)}
                            className="whitespace-nowrap"
                          >
                            {fixing && selectedIssue?.id === issue.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Fixing...
                              </>
                            ) : appliedFixes.has(issue.id) ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Fixed
                              </>
                            ) : (
                              'Fix Issue'
                            )}
                          </Button>
                          
                          <button
                            onClick={() => toggleIssueExpansion(issue.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                          >
                            {expandedIssues.has(issue.id) ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Less details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                More details
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Perfect Code!</h3>
                    <p className="text-gray-600">
                      No issues found. Your code follows best practices.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="suggestions" className="space-y-3 mt-4">
                {reviewResult.suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {reviewResult.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium mb-1">Suggestion #{index + 1}</div>
                          <div className="text-gray-700">{suggestion}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No general suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Lines of Code</div>
                    <div className="text-2xl font-bold">
                      {reviewResult.metrics?.linesOfCode || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Complexity Score</div>
                    <div className="text-2xl font-bold">
                      {reviewResult.metrics?.complexityScore || 'N/A'}/10
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Maintainability</div>
                    <div className="text-2xl font-bold">
                      {reviewResult.metrics?.maintainabilityIndex || 'N/A'}/100
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Duplication</div>
                    <div className="text-2xl font-bold">
                      {reviewResult.metrics?.duplicationPercentage || 'N/A'}%
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">Complexity Level</div>
                  <div className="flex items-center justify-between">
                    <Badge className={reviewResult.complexity === 'complex' ? 'bg-red-100 text-red-800' :
                              reviewResult.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'}>
                      {reviewResult.complexity.charAt(0).toUpperCase() + reviewResult.complexity.slice(1)}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      {reviewResult.complexity === 'complex' ? 'Advanced project structure' :
                       reviewResult.complexity === 'moderate' ? 'Standard application' :
                       'Simple component'}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Code Review</h3>
            <p className="text-gray-600 mb-6 max-w-sm">
              Get instant feedback on security, performance, and best practices. 
              AI will analyze your code and suggest improvements.
            </p>
            
            <div className="space-y-4 w-full max-w-xs">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Security Check</div>
                  <div className="text-sm text-gray-600">Find vulnerabilities</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Performance Audit</div>
                  <div className="text-sm text-gray-600">Optimize speed & memory</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Best Practices</div>
                  <div className="text-sm text-gray-600">Follow industry standards</div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleReview} 
              disabled={reviewing || !code.trim()}
              className="mt-8"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Start AI Code Review
            </Button>
            
            <p className="text-xs text-gray-500 mt-4">
              Powered by GPT-4 & Gemini AI • Reviews in seconds
            </p>
          </div>
        )}
      </CardContent>
      
      {reviewResult && (
        <CardFooter className="border-t pt-3">
          <div className="flex items-center justify-between w-full text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>Issues found: {reviewResult.issues.length}</span>
              <span>•</span>
              <span>Fixed: {appliedFixes.size}</span>
            </div>
            <button
              onClick={() => setReviewResult(null)}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              <X className="w-3 h-3" />
              Clear Results
            </button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
