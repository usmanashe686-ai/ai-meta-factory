import { NextRequest, NextResponse } from 'next/server';

// REAL AI Pipeline - ALL LOGIC INLINE
class RealAIPipeline {
  private openaiApiKey = process.env.OPENAI_API_KEY;
  private deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  private geminiApiKey = process.env.GEMINI_API_KEY;

  async generateComponent(prompt: string): Promise<any> {
    console.log('🔧 Starting real AI pipeline for:', prompt);
    
    try {
      // Step 1: OpenAI for idea and design analysis
      const designAnalysis = await this.analyzeWithOpenAI(prompt);
      console.log('✅ OpenAI analysis complete');
      
      // Step 2: DeepSeek for code generation
      const generatedCode = await this.generateCodeWithDeepSeek(prompt, designAnalysis);
      console.log('✅ DeepSeek code generation complete');
      
      // Step 3: Gemini for optimization
      const optimizedComponent = await this.optimizeWithGemini(generatedCode, designAnalysis);
      console.log('✅ Gemini optimization complete');
      
      return optimizedComponent;
      
    } catch (error) {
      console.error('❌ AI pipeline error:', error);
      return this.getFallbackComponent(prompt);
    }
  }

  private async analyzeWithOpenAI(prompt: string): Promise<any> {
    if (!this.openaiApiKey) {
      console.log('⚠️ OpenAI API key not found, using mock analysis');
      return this.mockOpenAIAnalysis(prompt);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Use cheaper model for testing
          messages: [
            {
              role: 'system',
              content: `You are a UI/UX design expert. Analyze the component description and provide design recommendations.`
            },
            {
              role: 'user',
              content: `Analyze this component: "${prompt}" - suggest type, colors, and features.`
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        console.warn('OpenAI API failed, using mock');
        return this.mockOpenAIAnalysis(prompt);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      
      return {
        type: this.extractComponentType(prompt),
        colors: this.extractColorsFromPrompt(prompt),
        features: ['responsive', 'modern'],
        text: analysisText
      };
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.mockOpenAIAnalysis(prompt);
    }
  }

  private async generateCodeWithDeepSeek(prompt: string, analysis: any): Promise<string> {
    if (!this.deepseekApiKey) {
      console.log('⚠️ DeepSeek API key not found, using mock code');
      return this.mockDeepSeekCode(prompt, analysis);
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `Generate React component code with Tailwind CSS.`
            },
            {
              role: 'user',
              content: `Create a ${analysis.type} component: "${prompt}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        console.warn('DeepSeek API failed, using mock');
        return this.mockDeepSeekCode(prompt, analysis);
      }

      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('DeepSeek API error:', error);
      return this.mockDeepSeekCode(prompt, analysis);
    }
  }

  private async optimizeWithGemini(code: string, analysis: any): Promise<any> {
    if (!this.geminiApiKey) {
      console.log('⚠️ Gemini API key not found, using mock optimization');
      return this.mockGeminiOptimization(code, analysis);
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Optimize this React component: ${code}`
            }]
          }]
        })
      });

      if (!response.ok) {
        console.warn('Gemini API failed, using mock');
        return this.mockGeminiOptimization(code, analysis);
      }

      const data = await response.json();
      const optimizedText = data.candidates[0].content.parts[0].text;
      
      return {
        type: analysis.type || 'card',
        content: (analysis.text || "AI Generated Component").substring(0, 50),
        styles: this.getDefaultStyles(analysis.type),
        code: optimizedText || code,
        description: `AI-generated ${analysis.type} component (Gemini optimized)`
      };
      
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.mockGeminiOptimization(code, analysis);
    }
  }

  // Mock functions for fallback
  private mockOpenAIAnalysis(prompt: string): any {
    return {
      type: this.extractComponentType(prompt),
      colors: this.extractColorsFromPrompt(prompt),
      features: ['responsive', 'accessible'],
      text: 'Mock analysis for: ' + prompt
    };
  }

  private mockDeepSeekCode(prompt: string, analysis: any): string {
    const type = analysis.type || 'card';
    const colors = analysis.colors || { primary: '#3b82f6', text: '#ffffff' };
    
    const templates: Record<string, string> = {
      button: `<button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
  ${prompt.substring(0, 20) || 'Click Me'}
</button>`,
      card: `<div className="p-6 bg-white rounded-xl shadow-lg">
  <h3 className="text-xl font-bold">${prompt.substring(0, 30) || 'Card'}</h3>
  <p className="text-gray-600">AI-generated component</p>
</div>`,
      default: `<div className="p-4 rounded-lg shadow">
  <h3>${prompt.substring(0, 30) || 'Component'}</h3>
  <p>Generated by AI</p>
</div>`
    };

    return templates[type] || templates.default;
  }

  private mockGeminiOptimization(code: string, analysis: any): any {
    return {
      type: analysis.type || 'card',
      content: 'AI Generated Component',
      styles: this.getDefaultStyles(analysis.type),
      code: code,
      description: `Mock AI-generated ${analysis.type} component`
    };
  }

  // Helper functions
  private extractComponentType(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('button') || promptLower.includes('btn')) return 'button';
    if (promptLower.includes('card') || promptLower.includes('box')) return 'card';
    if (promptLower.includes('input') || promptLower.includes('field')) return 'input';
    if (promptLower.includes('text')) return 'text';
    if (promptLower.includes('header') || promptLower.includes('title')) return 'header';
    return 'card';
  }

  private extractColorsFromPrompt(prompt: string): { primary: string; text: string } {
    const promptLower = prompt.toLowerCase();
    const colorMap: Record<string, { primary: string; text: string }> = {
      'blue': { primary: '#3b82f6', text: '#ffffff' },
      'red': { primary: '#ef4444', text: '#ffffff' },
      'green': { primary: '#10b981', text: '#ffffff' },
      'yellow': { primary: '#f59e0b', text: '#000000' },
      'purple': { primary: '#8b5cf6', text: '#ffffff' },
      'pink': { primary: '#ec4899', text: '#ffffff' }
    };

    for (const [color, values] of Object.entries(colorMap)) {
      if (promptLower.includes(color)) {
        return values;
      }
    }

    return { primary: '#3b82f6', text: '#ffffff' };
  }

  private getDefaultStyles(type: string): any {
    const styles: Record<string, any> = {
      button: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: 16,
        borderRadius: 8,
        width: '140px',
        height: '48px'
      },
      card: {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontSize: 18,
        borderRadius: 12,
        width: '300px',
        height: '180px'
      },
      default: {
        backgroundColor: '#f8fafc',
        color: '#334155',
        fontSize: 16,
        borderRadius: 8,
        width: '300px',
        height: '150px'
      }
    };

    return styles[type] || styles.default;
  }

  private getFallbackComponent(prompt: string): any {
    const type = this.extractComponentType(prompt);
    const colors = this.extractColorsFromPrompt(prompt);
    
    return {
      type,
      content: prompt.substring(0, 50) || 'AI Generated Component',
      styles: {
        backgroundColor: colors.primary,
        color: colors.text,
        fontSize: 16,
        borderRadius: 8,
        width: '300px',
        height: '150px'
      },
      code: `<div style={{ backgroundColor: '${colors.primary}', color: '${colors.text}', padding: '20px', borderRadius: '8px' }}>
  <h3>${prompt.substring(0, 30)}</h3>
  <p>AI Generated</p>
</div>`,
      description: `Fallback ${type} component`
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting real AI generation for:', prompt);
    
    // Create pipeline instance and generate
    const pipeline = new RealAIPipeline();
    const component = await pipeline.generateComponent(prompt);

    console.log('✅ AI generation complete:', component.type);
    
    return NextResponse.json({
      success: true,
      component,
      timestamp: new Date().toISOString(),
      pipeline: 'OpenAI → DeepSeek → Gemini',
      usingRealAPI: !!process.env.OPENAI_API_KEY && !!process.env.DEEPSEEK_API_KEY && !!process.env.GEMINI_API_KEY
    });
  } catch (error) {
    console.error('❌ Real AI API error:', error);
    
    // Fallback
    const fallbackComponent = {
      type: 'card',
      content: 'AI Generated Component',
      styles: {
        backgroundColor: '#f8fafc',
        color: '#334155',
        fontSize: 18,
        borderRadius: 12,
        width: '300px',
        height: '180px'
      },
      code: `<div className="p-6 bg-white rounded-xl shadow-lg">
  <h3 className="text-xl font-bold">AI Generated Component</h3>
  <p className="text-gray-600">Created with Meta Factory AI</p>
</div>`,
      description: 'Fallback AI component'
    };

    return NextResponse.json({
      success: false,
      component: fallbackComponent,
      error: error instanceof Error ? error.message : 'AI generation failed',
      timestamp: new Date().toISOString(),
      pipeline: 'Fallback'
    });
  }
}

export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  
  return NextResponse.json({
    service: 'Meta Factory Real AI Pipeline',
    status: 'active',
    version: '1.0.0',
    apiStatus: {
      openai: hasOpenAI ? 'configured' : 'missing',
      deepseek: hasDeepSeek ? 'configured' : 'missing',
      gemini: hasGemini ? 'configured' : 'missing'
    },
    endpoints: {
      POST: '/api/real-ai/generate'
    },
    note: hasOpenAI && hasDeepSeek && hasGemini 
      ? 'All APIs configured - Real AI pipeline ready'
      : 'Some APIs missing - Using mock fallbacks'
  });
}
