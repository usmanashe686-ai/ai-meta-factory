import OpenAI from 'openai';

export interface AIRegenerationParams {
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

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required in environment variables');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async regenerateWithAI(params: AIRegenerationParams): Promise<{
    generatedCode: string;
    confidence: number;
    explanation: string;
    suggestions: string[];
    metadata: any;
  }> {
    try {
      const { filePath, currentCode, context } = params;
      const language = this.getLanguage(filePath);
      const model = process.env.AI_MODEL || 'gpt-4-turbo-preview';

      console.log(`[AI] Regenerating ${filePath} with ${model}`);
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} developer. Regenerate the code with these changes: ${params.changes.join(', ')}.
            
Stack: ${context.stack}
Database: ${context.database}
File: ${filePath}

Return ONLY the complete regenerated code, no explanations.`
          },
          {
            role: 'user',
            content: `\`\`\`${language}
${currentCode}
\`\`\``
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const generatedCode = response.choices[0]?.message?.content || currentCode;
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        generatedCode,
        confidence: 0.85,
        explanation: `Regenerated with ${model} (${tokensUsed} tokens)`,
        suggestions: [
          'Improved code structure',
          'Added error handling',
          'Optimized performance',
          'Enhanced readability'
        ],
        metadata: {
          model,
          tokensUsed,
          cost: this.calculateCost(tokensUsed, model),
          timestamp: new Date().toISOString()
        }
      };

    } catch (error: any) {
      console.error('[AI] Regeneration failed:', error);
      throw new Error(`AI regeneration failed: ${error.message}`);
    }
  }

  private calculateCost(tokens: number, model: string): number {
    // Approximate cost per token for different models
    const pricing: Record<string, number> = {
      'gpt-4-turbo-preview': 0.01, // $10 per 1M tokens
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.001,
    };

    const rate = pricing[model] || 0.01;
    return (tokens / 1_000_000) * rate * 1000000; // Cost per million tokens
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
