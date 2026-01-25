// Simple AI Service for Meta Factory
// This will handle AI component generation

export interface AIComponentResponse {
  success: boolean;
  component: {
    type: string;
    content: string;
    styles: {
      backgroundColor: string;
      color: string;
      fontSize: number;
      borderRadius: number;
      width: string;
      height: string;
    };
    description: string;
  };
  error?: string;
}

export class AIService {
  // For now, we'll use mock responses
  // Later, replace with actual API calls to OpenAI/DeepSeek/Gemini

  async generateComponent(prompt: string): Promise<AIComponentResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine component type from prompt
      const type = this.getComponentType(prompt);
      const colors = this.extractColors(prompt);
      
      // Mock response based on prompt
      const component = {
        type,
        content: this.generateContent(prompt, type),
        styles: {
          backgroundColor: colors.background,
          color: colors.text,
          fontSize: this.getFontSize(type),
          borderRadius: this.getBorderRadius(type),
          width: this.getWidth(type),
          height: this.getHeight(type)
        },
        description: `AI-generated ${type} component`
      };

      return {
        success: true,
        component
      };
    } catch (error) {
      return {
        success: false,
        component: this.getFallbackComponent(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getComponentType(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('button') || promptLower.includes('btn')) return 'button';
    if (promptLower.includes('card') || promptLower.includes('box')) return 'card';
    if (promptLower.includes('input') || promptLower.includes('field')) return 'input';
    if (promptLower.includes('text') || promptLower.includes('para')) return 'text';
    if (promptLower.includes('header') || promptLower.includes('title')) return 'header';
    return 'card'; // default
  }

  private extractColors(prompt: string): { background: string; text: string } {
    const promptLower = prompt.toLowerCase();
    const colorMap: Record<string, { background: string; text: string }> = {
      'blue': { background: '#3b82f6', text: '#ffffff' },
      'red': { background: '#ef4444', text: '#ffffff' },
      'green': { background: '#10b981', text: '#ffffff' },
      'yellow': { background: '#f59e0b', text: '#000000' },
      'purple': { background: '#8b5cf6', text: '#ffffff' },
      'pink': { background: '#ec4899', text: '#ffffff' },
      'gray': { background: '#6b7280', text: '#ffffff' },
      'black': { background: '#000000', text: '#ffffff' },
      'white': { background: '#ffffff', text: '#000000' }
    };

    for (const [color, values] of Object.entries(colorMap)) {
      if (promptLower.includes(color)) {
        return values;
      }
    }

    // Default colors
    return { background: '#3b82f6', text: '#ffffff' };
  }

  private generateContent(prompt: string, type: string): string {
    const baseContent = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
    
    switch (type) {
      case 'button':
        return `Click Me: ${baseContent}`;
      case 'card':
        return `Card: ${baseContent}`;
      case 'input':
        return `Input Field: ${baseContent}`;
      case 'header':
        return `Header: ${baseContent}`;
      default:
        return baseContent;
    }
  }

  private getFontSize(type: string): number {
    const sizes: Record<string, number> = {
      'header': 32,
      'button': 16,
      'card': 18,
      'input': 14,
      'text': 16
    };
    return sizes[type] || 16;
  }

  private getBorderRadius(type: string): number {
    const radii: Record<string, number> = {
      'button': 8,
      'card': 12,
      'input': 6,
      'header': 0,
      'text': 0
    };
    return radii[type] || 8;
  }

  private getWidth(type: string): string {
    const widths: Record<string, string> = {
      'button': '140px',
      'card': '300px',
      'input': '250px',
      'header': '400px',
      'text': '350px'
    };
    return widths[type] || '300px';
  }

  private getHeight(type: string): string {
    const heights: Record<string, string> = {
      'button': '48px',
      'card': '180px',
      'input': '40px',
      'header': '80px',
      'text': '100px'
    };
    return heights[type] || '150px';
  }

  private getFallbackComponent() {
    return {
      type: 'card',
      content: 'AI Generated Component',
      styles: {
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        fontSize: 18,
        borderRadius: 12,
        width: '300px',
        height: '180px'
      },
      description: 'Fallback AI component'
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
