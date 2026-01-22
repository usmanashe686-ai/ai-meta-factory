import { AIProvider, AIResponse } from '.';

export class DeepSeekProvider implements AIProvider {
  name = 'deepseek';
  pricePerToken = 0.00014; // $0.14 per 1M tokens
  maxTokens = 16384;

  async generate(prompt: string, options: any = {}): Promise<AIResponse> {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || 'deepseek-coder',
          messages: [
            {
              role: 'system',
              content: 'You are a code structuring expert. Format and structure code perfectly. Return ONLY the code, no explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: options.maxTokens || 2000,
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens || 0,
        model: data.model,
        provider: this.name
      };
    } catch (error) {
      console.error('DeepSeek Generation Error:', error);
      throw new Error(`DeepSeek failed: ${error.message}`);
    }
  }
}
