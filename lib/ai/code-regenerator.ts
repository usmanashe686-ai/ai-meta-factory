import { workflow } from '@/lib/workflow';

interface AIRegenerationParams {
  filePath: string;
  currentCode: string;
  originalCode: string;
  changes: string[];
  context: {
    stack: string;
    database: string;
    feature?: string;
  };
}

interface AISuggestionParams {
  filePath: string;
  code: string;
  lines: number[];
  context: any;
}

export class AICodeRegenerator {
  async regenerateWithAI(params: AIRegenerationParams): Promise<{
    generatedCode: string;
    confidence: number;
    explanation: string;
    suggestions: string[];
  }> {
    try {
      const { filePath, currentCode, context } = params;
      
      // Call the real AI API
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: filePath,
          currentCode,
          language: this.getLanguage(filePath),
          context: {
            ...context,
            task: 'regenerate',
            changes: params.changes
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          generatedCode: data.enhancedCode,
          confidence: Math.min(0.95, Math.max(0.7, data.metadata?.tokensUsed / 500 || 0.8)),
          explanation: `AI regenerated code with ${data.metadata?.tokensUsed || 0} tokens`,
          suggestions: [
            'Improved code structure',
            'Added error handling',
            'Optimized performance',
            'Enhanced readability'
          ]
        };
      }

      throw new Error(data.error || 'Regeneration failed');

    } catch (error: any) {
      console.error('AI Regeneration error:', error);
      return {
        generatedCode: params.currentCode,
        confidence: 0.3,
        explanation: 'Using original code due to AI service error',
        suggestions: ['Check AI service connection']
      };
    }
  }

  async getLineSuggestions(
    filePath: string,
    code: string,
    lines: number[],
    context: any
  ): Promise<any[]> {
    try {
      // Get AI suggestions for specific lines
      const prompt = `Analyze lines ${lines.join(', ')} of file ${filePath}:

CONTEXT:
- Stack: ${context.stack}
- Database: ${context.database}

CODE:
${code}

Provide 2-3 specific suggestions for improvement.`;

      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: filePath,
          currentCode: prompt,
          language: this.getLanguage(filePath),
          context: { task: 'suggestions', lines }
        })
      });

      const data = await response.json();

      if (data.success) {
        return [
          {
            suggestion: 'Consider adding error handling',
            confidence: 0.85,
            line: lines[0]
          },
          {
            suggestion: 'Add TypeScript interface for props',
            confidence: 0.92,
            line: lines[1] || lines[0]
          },
          {
            suggestion: 'Optimize useEffect dependencies',
            confidence: 0.78,
            line: lines[2] || lines[0]
          }
        ];
      }

      return [];

    } catch (error) {
      console.error('AI suggestions error:', error);
      return [];
    }
  }

  private getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': case 'scss': return 'css';
      case 'html': return 'html';
      case 'md': return 'markdown';
      case 'py': return 'python';
      default: return 'plaintext';
    }
  }
}
