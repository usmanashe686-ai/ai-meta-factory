export interface IdeaAnalysis {
  feasibility: number; // 0-100
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: string;
  suggestedTechStack: string[];
  coreFeatures: string[];
  potentialChallenges: string[];
}

export class IdeaAnalyzer {
  private static apiEndpoint = 'http://localhost:8000'; // Your Flask proxy

  /**
   * Analyze a project idea using the local AI model
   */
  static async analyze(idea: string): Promise<IdeaAnalysis> {
    try {
      const prompt = `Analyze the following project idea. Return a JSON object with these fields:
- feasibility (number 0-100)
- complexity (string: "low", "medium", or "high")
- estimatedTime (string, e.g., "2-4 weeks")
- suggestedTechStack (array of strings)
- coreFeatures (array of strings)
- potentialChallenges (array of strings)

Idea: "${idea}"

JSON:`;

      const response = await fetch(`${this.apiEndpoint}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tinyllama-1.1b', // or 'qwen2-0.5b'
          prompt,
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.text || data.generated_text || '';

      // Attempt to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          feasibility: parsed.feasibility ?? 50,
          complexity: parsed.complexity ?? 'medium',
          estimatedTime: parsed.estimatedTime ?? '3-5 weeks',
          suggestedTechStack: parsed.suggestedTechStack ?? [],
          coreFeatures: parsed.coreFeatures ?? [],
          potentialChallenges: parsed.potentialChallenges ?? [],
        };
      } else {
        console.warn('Could not parse AI response, using fallback');
        return this.fallbackAnalysis(idea);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.fallbackAnalysis(idea);
    }
  }

  /**
   * Generate a roadmap using AI
   */
  static async generateRoadmap(idea: string): Promise<string[]> {
    try {
      const prompt = `Create a step-by-step roadmap (as a JSON array of strings) for building this project: "${idea}"\n\nRoadmap:`;
      const response = await fetch(`${this.apiEndpoint}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tinyllama-1.1b',
          prompt,
          max_tokens: 200,
          temperature: 0.4,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const text = data.text || data.generated_text || '';

      // Try to extract array
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      } else {
        // Fallback: split by lines that look like steps
        return text
          .split('\n')
          .filter((line: string) => line.trim().match(/^\d+\./))
          .map((line: string) => line.replace(/^\d+\.\s*/, ''));
      }
    } catch (error) {
      console.error('Roadmap generation failed:', error);
      return [
        'Week 1: Planning and design',
        'Week 2: Core implementation',
        'Week 3: Testing and refinement',
        'Week 4: Deployment',
      ];
    }
  }

  private static fallbackAnalysis(idea: string): IdeaAnalysis {
    return {
      feasibility: 70,
      complexity: 'medium',
      estimatedTime: '3-5 weeks',
      suggestedTechStack: ['React', 'Node.js', 'MongoDB'],
      coreFeatures: ['User authentication', 'Data storage', 'API integration'],
      potentialChallenges: ['Scalability', 'Security'],
    };
  }
}
