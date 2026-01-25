// AI Pipeline Service for Meta Factory
// This handles the AI generation flow: OpenAI → DeepSeek → Gemini

export interface AIComponent {
  type: string;
  content: string;
  styles: {
    backgroundColor: string;
    color: string;
    fontSize: number;
    borderRadius: number;
    padding: string;
    margin: string;
    width: string;
    height: string;
  };
  code: string;
  description: string;
}

export class AIBuilderPipeline {
  // For now, we'll use mock responses
  // Replace with actual API calls when API keys are added

  async generateComponent(prompt: string): Promise<AIComponent> {
    console.log('Generating AI component for prompt:', prompt);
    
    // Step 1: Analyze prompt with OpenAI (mock)
    const analysis = await this.analyzeWithOpenAI(prompt);
    
    // Step 2: Generate code with DeepSeek (mock)
    const code = await this.generateCodeWithDeepSeek(analysis);
    
    // Step 3: Optimize with Gemini (mock)
    const optimizedComponent = await this.optimizeWithGemini(code, analysis);
    
    return optimizedComponent;
  }

  private async analyzeWithOpenAI(prompt: string): Promise<any> {
    // Mock OpenAI analysis
    return {
      componentType: this.determineComponentType(prompt),
      description: `A ${prompt.toLowerCase()} component`,
      features: ['responsive', 'modern', 'accessible'],
      styleGuide: {
        colors: this.extractColors(prompt),
        layout: 'flex',
        typography: 'system-ui'
      }
    };
  }

  private async generateCodeWithDeepSeek(analysis: any): Promise<string> {
    // Mock DeepSeek code generation
    const { componentType, description } = analysis;
    
    const templates: Record<string, string> = {
      button: `
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  ${description}
</button>
      `,
      card: `
<div className="bg-white rounded-xl shadow-lg p-6 max-w-sm">
  <h3 className="text-xl font-bold text-gray-900 mb-3">${description}</h3>
  <p className="text-gray-600">AI-generated component with modern design</p>
</div>
      `,
      input: `
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">${description}</label>
  <input 
    type="text" 
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Enter text..."
  />
</div>
      `,
      text: `
<div className="prose max-w-none">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">${description}</h2>
  <p className="text-gray-700">This is an AI-generated text component with optimal typography and spacing.</p>
</div>
      `
    };

    return templates[analysis.componentType] || templates.card;
  }

  private async optimizeWithGemini(code: string, analysis: any): Promise<AIComponent> {
    // Mock Gemini optimization
    const componentType = analysis.componentType;
    
    const styleMap: Record<string, any> = {
      button: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: 16,
        borderRadius: 8,
        padding: '12px 24px',
        margin: '4px',
        width: 'auto',
        height: 'auto'
      },
      card: {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontSize: 16,
        borderRadius: 12,
        padding: '24px',
        margin: '8px',
        width: '320px',
        height: 'auto'
      },
      input: {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontSize: 14,
        borderRadius: 8,
        padding: '8px 16px',
        margin: '4px',
        width: '256px',
        height: '40px'
      },
      text: {
        backgroundColor: 'transparent',
        color: '#1f2937',
        fontSize: 18,
        borderRadius: 0,
        padding: '16px',
        margin: '0',
        width: '100%',
        height: 'auto'
      }
    };

    const styles = styleMap[componentType] || styleMap.card;

    return {
      type: componentType,
      content: analysis.description,
      styles,
      code: code.trim(),
      description: `AI-generated ${componentType} component`
    };
  }

  private determineComponentType(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('button') || promptLower.includes('btn')) return 'button';
    if (promptLower.includes('card') || promptLower.includes('box')) return 'card';
    if (promptLower.includes('input') || promptLower.includes('field')) return 'input';
    if (promptLower.includes('text') || promptLower.includes('para')) return 'text';
    return 'card';
  }

  private extractColors(prompt: string): string[] {
    const colorKeywords: Record<string, string> = {
      'blue': '#3b82f6',
      'red': '#ef4444',
      'green': '#10b981',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'pink': '#ec4899',
      'gray': '#6b7280',
      'black': '#000000',
      'white': '#ffffff'
    };

    const colors: string[] = [];
    for (const [keyword, hex] of Object.entries(colorKeywords)) {
      if (prompt.toLowerCase().includes(keyword)) {
        colors.push(hex);
      }
    }

    return colors.length > 0 ? colors : ['#3b82f6', '#10b981', '#8b5cf6'];
  }
}

// Export singleton instance
export const aiPipeline = new AIBuilderPipeline();
