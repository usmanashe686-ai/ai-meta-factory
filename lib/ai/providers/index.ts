// Abstraction layer for all AI providers
export interface AIProvider {
  generate(prompt: string, options?: any): Promise<AIResponse>;
  pricePerToken: number;
  maxTokens: number;
  name: string;
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  model: string;
  provider: string;
}

// Factory pattern to create providers
export function createProvider(type: 'openai' | 'deepseek' | 'gemini'): AIProvider {
  switch(type) {
    case 'openai':
      return new OpenAIProvider();
    case 'deepseek':
      return new DeepSeekProvider();
    case 'gemini':
      return new GeminiProvider();
    default:
      throw new Error(`Unknown provider: ${type}`);
  }
}
