// Simplified AI Pipeline
export interface AIComponent {
  type: string;
  content: string;
  styles: {
    backgroundColor: string;
    color: string;
    fontSize: number;
    borderRadius: number;
  };
}

export class AIBuilderPipeline {
  async generateComponent(prompt: string): Promise<AIComponent> {
    // Simple mock response
    const type = prompt.toLowerCase().includes('button') ? 'button' : 
                 prompt.toLowerCase().includes('card') ? 'card' : 
                 prompt.toLowerCase().includes('input') ? 'input' : 'text';
    
    const colors = {
      button: { bg: '#3b82f6', text: '#ffffff' },
      card: { bg: '#ffffff', text: '#1f2937' },
      input: { bg: '#ffffff', text: '#1f2937' },
      text: { bg: 'transparent', text: '#000000' }
    };

    return {
      type,
      content: `AI Generated: ${prompt}`,
      styles: {
        backgroundColor: colors[type as keyof typeof colors].bg,
        color: colors[type as keyof typeof colors].text,
        fontSize: 16,
        borderRadius: 8
      }
    };
  }
}

export const aiPipeline = new AIBuilderPipeline();
