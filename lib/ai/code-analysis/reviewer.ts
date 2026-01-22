import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface CodeIssue {
  id: string
  type: 'security' | 'performance' | 'best-practice' | 'accessibility' | 'bug' | 'refactor'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  message: string
  line?: number
  column?: number
  suggestion: string
  fix?: string
  confidence: number // 0-1
  ruleId: string
}

export interface CodeReviewResult {
  score: number // 0-100
  issues: CodeIssue[]
  suggestions: string[]
  estimatedImprovement: string
  complexity: 'simple' | 'moderate' | 'complex'
  summary: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  metrics: {
    linesOfCode: number
    complexityScore: number
    maintainabilityIndex: number
    duplicationPercentage: number
  }
}

export interface CodeFix {
  original: string
  fixed: string
  description: string
  issueId: string
}

export class AICodeReviewer {
  private openai: OpenAI
  private genAI: GoogleGenerativeAI
  private modelCache: Map<string, any> = new Map()
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 30000,
      maxRetries: 3
    })
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  /**
   * Main code review method - analyzes code using multiple AI models
   */
  async reviewCode(code: string, language: string): Promise<CodeReviewResult> {
    console.log(`🔍 Reviewing ${language} code (${code.length} chars)...`)
    
    try {
      // Run parallel analysis with both models
      const [openaiReview, geminiReview] = await Promise.all([
        this.reviewWithOpenAI(code, language).catch(err => {
          console.error('OpenAI review failed:', err.message)
          return null
        }),
        this.reviewWithGemini(code, language).catch(err => {
          console.error('Gemini review failed:', err.message)
          return null
        })
      ])
      
      // Merge results from both models
      const mergedResult = this.mergeReviews(
        openaiReview, 
        geminiReview, 
        code, 
        language
      )
      
      console.log(`✅ Review complete: ${mergedResult.issues.length} issues found`)
      return mergedResult
      
    } catch (error) {
      console.error('Code review failed:', error)
      return this.getFallbackResult(code, language)
    }
  }

  /**
   * Generate automatic fix for a specific issue
   */
  async generateFix(issue: CodeIssue, code: string, context?: string): Promise<CodeFix> {
    console.log(`🔧 Generating fix for ${issue.type} issue...`)
    
    const prompt = `
      FIX THIS CODE ISSUE:
      
      ISSUE DETAILS:
      - Type: ${issue.type}
      - Severity: ${issue.severity}
      - Message: ${issue.message}
      - Suggestion: ${issue.suggestion}
      - Line: ${issue.line || 'N/A'}
      
      CONTEXT (if provided):
      ${context || 'No additional context'}
      
      ORIGINAL CODE:
      \`\`\`${this.getLanguageFromCode(code)}
      ${code}
      \`\`\`
      
      YOUR TASK:
      1. Generate the fixed code
      2. Keep the same functionality
      3. Maintain code style consistency
      4. Add comments if the fix is non-trivial
      5. Return ONLY the fixed code block
      
      FIXED CODE:
    `
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer fixing code issues. Return only the fixed code.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
      
      const fixedCode = response.choices[0].message.content?.trim() || code
      
      return {
        original: code,
        fixed: fixedCode,
        description: `Fixed ${issue.type} issue: ${issue.message}`,
        issueId: issue.id
      }
      
    } catch (error) {
      console.error('Fix generation failed:', error)
      return {
        original: code,
        fixed: code,
        description: 'Failed to generate automatic fix',
        issueId: issue.id
      }
    }
  }

  /**
   * Review code using OpenAI (GPT-4)
   */
  private async reviewWithOpenAI(code: string, language: string): Promise<Partial<CodeReviewResult>> {
    const prompt = this.buildOpenAIPrompt(code, language)
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 3000
    })
    
    const content = response.choices[0].message.content
    if (!content) throw new Error('No response from OpenAI')
    
    return this.parseOpenAIResponse(JSON.parse(content), code, language)
  }

  /**
   * Review code using Google Gemini
   */
  private async reviewWithGemini(code: string, language: string): Promise<Partial<CodeReviewResult>> {
    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2000,
      }
    })
    
    const prompt = this.buildGeminiPrompt(code, language)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return this.parseGeminiResponse(text, code, language)
  }

  /**
   * Build comprehensive prompt for OpenAI
   */
  private buildOpenAIPrompt(code: string, language: string): string {
    return `
      Perform a comprehensive code review for this ${language} code.
      
      CODE TO REVIEW:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      REVIEW REQUIREMENTS:
      1. SECURITY: Find vulnerabilities (XSS, SQLi, auth issues, etc.)
      2. PERFORMANCE: Identify slow operations, memory leaks, expensive loops
      3. BEST PRACTICES: Check for anti-patterns, code smells, maintainability
      4. ACCESSIBILITY: Ensure WCAG compliance for UI code
      5. BUGS: Find logical errors, edge cases, potential crashes
      6. REFACTORING: Suggest improvements for readability and structure
      
      FOR EACH ISSUE, provide:
      - type: security|performance|best-practice|accessibility|bug|refactor
      - severity: critical|high|medium|low|info
      - message: Clear description of the issue
      - line: Line number (if applicable)
      - suggestion: How to fix it
      - confidence: 0.0-1.0
      - ruleId: Unique identifier (e.g., "SEC-001", "PERF-003")
      
      CALCULATE METRICS:
      - linesOfCode: Count of actual code lines
      - complexityScore: 1-10 based on cyclomatic complexity
      - maintainabilityIndex: 0-100
      - duplicationPercentage: 0-100
      
      RETURN FORMAT (JSON):
      {
        "score": 85,
        "issues": [
          {
            "id": "unique-id",
            "type": "security",
            "severity": "high",
            "message": "Potential SQL injection",
            "line": 15,
            "suggestion": "Use parameterized queries",
            "confidence": 0.9,
            "ruleId": "SEC-001"
          }
        ],
        "suggestions": ["Use const for variables that don't change"],
        "estimatedImprovement": "15% performance gain",
        "complexity": "moderate",
        "summary": {
          "critical": 0,
          "high": 2,
          "medium": 3,
          "low": 5,
          "info": 10
        },
        "metrics": {
          "linesOfCode": 50,
          "complexityScore": 4,
          "maintainabilityIndex": 78,
          "duplicationPercentage": 12
        }
      }
      
      Be thorough but practical. Focus on real issues that matter.
    `
  }

  /**
   * Parse and validate OpenAI response
   */
  private parseOpenAIResponse(response: any, code: string, language: string): Partial<CodeReviewResult> {
    // Add unique IDs to issues
    const issues = (response.issues || []).map((issue: any, index: number) => ({
      id: `openai-${Date.now()}-${index}`,
      ...issue,
      confidence: issue.confidence || 0.8
    }))
    
    return {
      score: response.score || 70,
      issues,
      suggestions: response.suggestions || [],
      estimatedImprovement: response.estimatedImprovement || 'Minor improvements',
      complexity: response.complexity || 'moderate',
      summary: response.summary || { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      metrics: response.metrics || {
        linesOfCode: this.countLines(code),
        complexityScore: 5,
        maintainabilityIndex: 75,
        duplicationPercentage: 10
      }
    }
  }

  /**
   * Helper methods
   */
  private countLines(code: string): number {
    return code.split('\n').filter(line => line.trim().length > 0).length
  }

  private getLanguageFromCode(code: string): string {
    // Simple language detection
    if (code.includes('useState') || code.includes('react')) return 'typescript'
    if (code.includes('def ') || code.includes('import ')) return 'python'
    if (code.includes('function(') || code.includes('const ')) return 'javascript'
    return 'typescript'
  }

  /**
   * Fallback result if AI fails
   */
  private getFallbackResult(code: string, language: string): CodeReviewResult {
    return {
      score: 70,
      issues: [],
      suggestions: ['Run review again when AI service is available'],
      estimatedImprovement: 'Basic improvements',
      complexity: 'simple',
      summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      metrics: {
        linesOfCode: this.countLines(code),
        complexityScore: 5,
        maintainabilityIndex: 75,
        duplicationPercentage: 10
      }
    }
  }

  /**
   * Merge results from multiple AI models
   */
  private mergeReviews(
    openaiResult: Partial<CodeReviewResult> | null,
    geminiResult: Partial<CodeReviewResult> | null,
    code: string,
    language: string
  ): CodeReviewResult {
    // Use OpenAI as primary if available
    const primary = openaiResult || geminiResult
    
    if (!primary) {
      return this.getFallbackResult(code, language)
    }
    
    // Combine issues, removing duplicates
    const allIssues = [
      ...(openaiResult?.issues || []),
      ...(geminiResult?.issues || [])
    ]
    
    // Remove duplicates based on message and line
    const uniqueIssues = Array.from(
      new Map(allIssues.map(issue => [
        `${issue.message}-${issue.line}`,
        issue
      ])).values()
    )
    
    return {
      score: primary.score || 70,
      issues: uniqueIssues,
      suggestions: [...new Set([
        ...(openaiResult?.suggestions || []),
        ...(geminiResult?.suggestions || [])
      ])],
      estimatedImprovement: primary.estimatedImprovement || 'Combined improvements',
      complexity: primary.complexity || 'moderate',
      summary: primary.summary || { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      metrics: primary.metrics || {
        linesOfCode: this.countLines(code),
        complexityScore: 5,
        maintainabilityIndex: 75,
        duplicationPercentage: 10
      }
    }
  }

  // Gemini methods (simplified for now)
  private buildGeminiPrompt(code: string, language: string): string {
    return `Review this ${language} code for issues: ${code.substring(0, 3000)}`
  }

  private parseGeminiResponse(text: string, code: string, language: string): Partial<CodeReviewResult> {
    // Simple parsing for Gemini response
    return {
      score: 75,
      issues: [],
      suggestions: ['Run full review with OpenAI for detailed analysis'],
      estimatedImprovement: 'Basic improvements',
      complexity: 'simple'
    }
  }
}
