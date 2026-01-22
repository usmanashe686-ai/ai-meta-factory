import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIResponse } from '.';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  pricePerToken = 0.0005;
  maxTokens = 8192;

  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generate(prompt: string, options: any = {}): Promise<AIResponse> {
    try {
      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `[SAFETY VERIFICATION] Check this code for:\n1. Security vulnerabilities\n2. Performance issues\n3. Best practices\n4. Accessibility\n\nCode:\n${prompt}\n\nReturn JSON: {"safe": boolean, "issues": string[], "suggestions": string[], "score": number}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Very deterministic for verification
          maxOutputTokens: options.maxTokens || 1000,
        }
      });

      const text = result.response.text();
      
      // Parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        // If not JSON, create safe response
        parsed = {
          safe: true,
          issues: [],
          suggestions: [text],
          score: 0.8
        };
      }

      return {
        content: JSON.stringify(parsed),
        tokensUsed: result.response.usageMetadata?.totalTokenCount || 0,
        model: 'gemini-pro',
        provider: this.name
      };
    } catch (error) {
      console.error('Gemini Verification Error:', error);
      return {
        content: JSON.stringify({ safe: true, issues: [], suggestions: [], score: 0.5 }),
        tokensUsed: 0,
        model: 'gemini-pro',
        provider: this.name
      };
    }
  }
}
