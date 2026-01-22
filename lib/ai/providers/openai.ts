import OpenAI from 'openai';
import { AIProvider, AIResponse } from '.';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  pricePerToken = 0.002; // $ per 1K tokens
  maxTokens = 4096;
  
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async generate(prompt: string, options: any = {}): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a creative UI/UX component generator. Generate innovative, modern UI components.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8, // More creative
        max_tokens: options.maxTokens || this.maxTokens,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model,
        provider: this.name
      };
    } catch (error) {
      console.error('OpenAI Generation Error:', error);
      throw new Error(`OpenAI failed: ${error.message}`);
    }
  }
}
