export interface ExtractedFeature {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
}

export class FeatureExtractor {
  private static get apiEndpoint() {
  return process.env.NEXT_PUBLIC_AI_URL || 'process.env.NEXT_PUBLIC_API_URL';
}

  /**
   * Extract features from a project idea using AI.
   */
  static async extractFeatures(idea: string): Promise<ExtractedFeature[]> {
    try {
      const prompt = `Extract the core features from the following project idea. Return a JSON array of objects, each with "name", "description", and "priority" (high/medium/low).\n\nIdea: "${idea}"\n\nFeatures:`;

      const response = await fetch(`${this.apiEndpoint}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tinyllama-1.1b',
          prompt,
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!response.ok) throw new Error(`AI service error: ${response.status}`);

      const data = await response.json();
      const text = data.text || data.generated_text || '';

      // Try to parse JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure each item has required fields
        return parsed.map((f: any) => ({
          name: f.name || 'Unnamed feature',
          description: f.description || '',
          priority: f.priority || 'medium',
          category: f.category,
        }));
      } else {
        console.warn('Could not parse features, using fallback');
        return this.fallbackFeatures(idea);
      }
    } catch (error) {
      console.error('Feature extraction failed:', error);
      return this.fallbackFeatures(idea);
    }
  }

  private static fallbackFeatures(idea: string): ExtractedFeature[] {
    // Generate some plausible features based on keywords
    const features: ExtractedFeature[] = [];
    if (idea.toLowerCase().includes('user')) {
      features.push({
        name: 'User Authentication',
        description: 'Allow users to sign up and log in securely.',
        priority: 'high',
        category: 'auth',
      });
    }
    if (idea.toLowerCase().includes('data')) {
      features.push({
        name: 'Data Storage',
        description: 'Store and retrieve user data from a database.',
        priority: 'high',
        category: 'backend',
      });
    }
    if (idea.toLowerCase().includes('api')) {
      features.push({
        name: 'API Integration',
        description: 'Integrate with external APIs for additional functionality.',
        priority: 'medium',
        category: 'integration',
      });
    }
    if (idea.toLowerCase().includes('mobile')) {
      features.push({
        name: 'Mobile Responsive UI',
        description: 'Ensure the interface works well on mobile devices.',
        priority: 'high',
        category: 'ui',
      });
    }
    if (idea.toLowerCase().includes('analytics')) {
      features.push({
        name: 'Analytics Dashboard',
        description: 'Display metrics and insights to users.',
        priority: 'medium',
        category: 'analytics',
      });
    }
    // Default feature if none matched
    if (features.length === 0) {
      features.push({
        name: 'Core Functionality',
        description: 'Implement the main purpose of the application.',
        priority: 'high',
        category: 'core',
      });
    }
    return features;
  }
}
