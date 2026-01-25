// REAL AI Pipeline Service for Meta Factory
// Uses: OpenAI → DeepSeek → Gemini

export interface AIComponent {
  type: string;
  content: string;
  styles: {
    backgroundColor: string;
    color: string;
    fontSize: number;
    borderRadius: number;
    width: string;
    height: string;
    padding: string;
    margin: string;
  };
  code: string;
  description: string;
}

export class RealAIPipeline {
  // These will be loaded from environment variables
  private openaiApiKey = process.env.OPENAI_API_KEY;
  private deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  private geminiApiKey = process.env.GEMINI_API_KEY;

  async generateComponent(prompt: string): Promise<AIComponent> {
    console.log('🔧 Starting real AI pipeline for:', prompt);
    
    try {
      // Step 1: OpenAI for idea and design analysis
      const designAnalysis = await this.analyzeWithOpenAI(prompt);
      console.log('✅ OpenAI analysis complete:', designAnalysis);
      
      // Step 2: DeepSeek for code generation
      const generatedCode = await this.generateCodeWithDeepSeek(prompt, designAnalysis);
      console.log('✅ DeepSeek code generation complete');
      
      // Step 3: Gemini for optimization and safety
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
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are a UI/UX design expert. Analyze the component description and provide:
              1. Component type (button, card, input, text, header, etc.)
              2. Color scheme based on description
              3. Layout preferences
              4. Key features needed
              5. Accessibility considerations
              
              Return as JSON with: type, colors, layout, features, accessibility`
            },
            {
              role: 'user',
              content: `Analyze this component description: "${prompt}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      
      // Parse JSON from response
      try {
        return JSON.parse(analysisText);
      } catch {
        // If JSON parsing fails, extract information
        return this.extractAnalysisFromText(analysisText, prompt);
      }
      
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
          model: 'deepseek-coder',
          messages: [
            {
              role: 'system',
              content: `You are an expert React/Tailwind CSS developer. Generate clean, modern React component code with Tailwind CSS.
              Requirements:
              1. Use functional components
              2. Use Tailwind CSS for styling
              3. Make it responsive and accessible
              4. Include proper TypeScript types if needed
              5. Add comments for key parts
              
              Return ONLY the React component code, no explanations.`
            },
            {
              role: 'user',
              content: `Generate a ${analysis.type || 'card'} component based on: "${prompt}"
              Design analysis: ${JSON.stringify(analysis, null, 2)}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('DeepSeek API error:', error);
      return this.mockDeepSeekCode(prompt, analysis);
    }
  }

  private async optimizeWithGemini(code: string, analysis: any): Promise<AIComponent> {
    if (!this.geminiApiKey) {
      console.log('⚠️ Gemini API key not found, using mock optimization');
      return this.mockGeminiOptimization(code, analysis);
    }

    try {
      // Note: Gemini API might have different endpoint structure
      // This is a generic example - adjust based on actual Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Optimize this React component code and extract styling properties:
              
              Code to optimize:
              ${code}
              
              Design analysis:
              ${JSON.stringify(analysis, null, 2)}
              
              Provide:
              1. Optimized React code (with improvements)
              2. CSS properties object with:
                 - backgroundColor
                 - color
                 - fontSize
                 - borderRadius
                 - width
                 - height
                 - padding
                 - margin
              3. Component description
              
              Return as JSON: { optimizedCode, styles, description, type }`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const optimizationText = data.candidates[0].content.parts[0].text;
      
      try {
        // Try to parse JSON response
        const optimization = JSON.parse(optimizationText);
        return {
          type: analysis.type || 'card',
          content: prompt || 'AI Generated Component',
          styles: optimization.styles || this.getDefaultStyles(analysis.type),
          code: optimization.optimizedCode || code,
          description: optimization.description || `AI-generated ${analysis.type} component`
        };
      } catch {
        // If JSON parsing fails, use default
        return this.createComponentFromAnalysis(code, analysis);
      }
      
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.mockGeminiOptimization(code, analysis);
    }
  }

  // Mock functions for fallback
  private mockOpenAIAnalysis(prompt: string): any {
    const type = this.extractComponentType(prompt);
    const colors = this.extractColorsFromPrompt(prompt);
    
    return {
      type,
      colors: {
        primary: colors.background,
        text: colors.text,
        accent: this.getAccentColor(colors.background)
      },
      layout: 'flex',
      features: ['responsive', 'accessible', 'modern'],
      accessibility: {
        contrast: 'good',
        ariaLabel: prompt.substring(0, 50)
      }
    };
  }

  private mockDeepSeekCode(prompt: string, analysis: any): string {
    const type = analysis.type || 'card';
    const colors = analysis.colors || { primary: '#3b82f6', text: '#ffffff' };
    
    const templates: Record<string, string> = {
      button: `const Button = () => {
  return (
    <button 
      className="px-6 py-3 rounded-lg font-medium transition-colors"
      style={{
        backgroundColor: '${colors.primary}',
        color: '${colors.text}'
      }}
    >
      ${prompt.substring(0, 20) || 'Click Me'}
    </button>
  );
};`,
      
      card: `const Card = () => {
  return (
    <div 
      className="rounded-xl shadow-lg p-6 max-w-sm"
      style={{
        backgroundColor: '${colors.primary}',
        color: '${colors.text}'
      }}
    >
      <h3 className="text-xl font-bold mb-3">${prompt.substring(0, 30) || 'Card Title'}</h3>
      <p className="opacity-90">AI-generated component with modern design</p>
    </div>
  );
};`,
      
      input: `const InputField = () => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        ${prompt.substring(0, 20) || 'Input Label'}
      </label>
      <input 
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter text..."
      />
    </div>
  );
};`,
      
      default: `const Component = () => {
  return (
    <div 
      className="p-6 rounded-lg shadow"
      style={{
        backgroundColor: '${colors.primary}',
        color: '${colors.text}',
        borderRadius: '12px'
      }}
    >
      <h2 className="text-2xl font-bold mb-4">${prompt.substring(0, 30) || 'Component'}</h2>
      <p>Generated by Meta Factory AI</p>
    </div>
  );
};`
    };

    return templates[type] || templates.default;
  }

  private mockGeminiOptimization(code: string, analysis: any): AIComponent {
    const type = analysis.type || 'card';
    const colors = analysis.colors || { primary: '#3b82f6', text: '#ffffff' };
    
    return {
      type,
      content: 'AI Generated Component',
      styles: {
        backgroundColor: colors.primary,
        color: colors.text,
        fontSize: type === 'button' ? 16 : type === 'header' ? 32 : 18,
        borderRadius: type === 'button' ? 8 : type === 'card' ? 12 : 0,
        width: type === 'button' ? '140px' : type === 'input' ? '250px' : '300px',
        height: type === 'button' ? '48px' : type === 'input' ? '40px' : '180px',
        padding: type === 'button' ? '12px 24px' : type === 'card' ? '24px' : '16px',
        margin: '8px'
      },
      code: code,
      description: `AI-generated ${type} component`
    };
  }

  // Helper functions
  private extractComponentType(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('button') || promptLower.includes('btn')) return 'button';
    if (promptLower.includes('card') || promptLower.includes('box')) return 'card';
    if (promptLower.includes('input') || promptLower.includes('field')) return 'input';
    if (promptLower.includes('text') || promptLower.includes('para')) return 'text';
    if (promptLower.includes('header') || promptLower.includes('title')) return 'header';
    if (promptLower.includes('navbar') || promptLower.includes('menu')) return 'navbar';
    return 'card';
  }

  private extractColorsFromPrompt(prompt: string): { background: string; text: string } {
    const promptLower = prompt.toLowerCase();
    const colorMap: Record<string, { background: string; text: string }> = {
      'blue': { background: '#3b82f6', text: '#ffffff' },
      'red': { background: '#ef4444', text: '#ffffff' },
      'green': { background: '#10b981', text: '#ffffff' },
      'yellow': { background: '#f59e0b', text: '#000000' },
      'purple': { background: '#8b5cf6', text: '#ffffff' },
      'pink': { background: '#ec4899', text: '#ffffff' },
      'gray': { background: '#6b7280', text: '#ffffff' },
      'dark': { background: '#1f2937', text: '#ffffff' },
      'light': { background: '#f3f4f6', text: '#000000' },
      'white': { background: '#ffffff', text: '#000000' },
      'black': { background: '#000000', text: '#ffffff' }
    };

    for (const [color, values] of Object.entries(colorMap)) {
      if (promptLower.includes(color)) {
        return values;
      }
    }

    return { background: '#3b82f6', text: '#ffffff' };
  }

  private getAccentColor(primaryColor: string): string {
    // Simple accent color generation
    const colors = ['#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private extractAnalysisFromText(text: string, prompt: string): any {
    // Extract analysis from text response
    return {
      type: this.extractComponentType(prompt),
      colors: this.extractColorsFromPrompt(prompt),
      layout: 'flex',
      features: ['responsive'],
      accessibility: { contrast: 'good' }
    };
  }

  private getDefaultStyles(type: string): any {
    const styles: Record<string, any> = {
      button: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: 16,
        borderRadius: 8,
        width: '140px',
        height: '48px',
        padding: '12px 24px',
        margin: '4px'
      },
      card: {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontSize: 18,
        borderRadius: 12,
        width: '300px',
        height: '180px',
        padding: '24px',
        margin: '8px'
      },
      input: {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontSize: 14,
        borderRadius: 6,
        width: '250px',
        height: '40px',
        padding: '8px 16px',
        margin: '4px'
      },
      default: {
        backgroundColor: '#f8fafc',
        color: '#334155',
        fontSize: 16,
        borderRadius: 8,
        width: '300px',
        height: '150px',
        padding: '20px',
        margin: '8px'
      }
    };

    return styles[type] || styles.default;
  }

  private createComponentFromAnalysis(code: string, analysis: any): AIComponent {
    const type = analysis.type || 'card';
    
    return {
      type,
      content: 'AI Generated Component',
      styles: this.getDefaultStyles(type),
      code: code,
      description: `AI-generated ${type} component`
    };
  }

  private getFallbackComponent(prompt: string): AIComponent {
    const type = this.extractComponentType(prompt);
    const colors = this.extractColorsFromPrompt(prompt);
    
    return {
      type,
      content: prompt.substring(0, 50) || 'AI Generated Component',
      styles: {
        backgroundColor: colors.background,
        color: colors.text,
        fontSize: 16,
        borderRadius: 8,
        width: '300px',
        height: '150px',
        padding: '20px',
        margin: '8px'
      },
      code: `<div style={{
        backgroundColor: '${colors.background}',
        color: '${colors.text}',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3>${prompt.substring(0, 30) || 'Component'}</h3>
        <p>Generated by Meta Factory AI</p>
      </div>`,
      description: `Fallback ${type} component`
    };
  }
}

// Export singleton instance
export const realAIPipeline = new RealAIPipeline();
