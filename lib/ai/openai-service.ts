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
  // This service will be called from API routes, not directly from client
  async regenerateWithAI(params: AIRegenerationParams): Promise<{
    generatedCode: string;
    confidence: number;
    explanation: string;
    suggestions: string[];
    metadata: any;
  }> {
    try {
      // Call our API route
      const response = await fetch('/api/ai/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI regeneration failed');
      }

      const result = await response.json();
      return result;
      
    } catch (error: any) {
      console.error('[AI] Regeneration failed:', error);
      
      // Fallback: return enhanced code without AI
      return {
        generatedCode: params.currentCode + '\n\n// 🚀 AI Enhancement would be available with proper OpenAI API key\n// Check your environment variables',
        confidence: 0.0,
        explanation: 'AI service not configured properly',
        suggestions: ['Set OPENAI_API_KEY environment variable'],
        metadata: {
          model: 'fallback',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }
}
