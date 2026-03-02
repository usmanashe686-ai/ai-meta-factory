export interface RoadmapStep {
  week: number;
  title: string;
  description: string;
  tasks: string[];
  status?: 'pending' | 'in-progress' | 'completed';
}

export class RoadmapGenerator {
  private static get apiEndpoint() {
  return process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
}

  /**
   * Generate a detailed roadmap for a project idea.
   */
  static async generateRoadmap(idea: string): Promise<RoadmapStep[]> {
    try {
      const prompt = `Create a detailed project roadmap for the following idea. Return a JSON array of objects, each with "week" (number), "title" (string), "description" (string), and "tasks" (array of strings).\n\nIdea: "${idea}"\n\nRoadmap:`;

      const response = await fetch(`${this.apiEndpoint}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tinyllama-1.1b',
          prompt,
          max_tokens: 500,
          temperature: 0.4,
        }),
      });

      if (!response.ok) throw new Error(`AI service error: ${response.status}`);

      const data = await response.json();
      const text = data.text || data.generated_text || '';

      // Try to parse JSON array
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((step: any) => ({
          week: step.week || 1,
          title: step.title || 'Untitled step',
          description: step.description || '',
          tasks: step.tasks || [],
          status: 'pending',
        }));
      } else {
        console.warn('Could not parse roadmap, using fallback');
        return this.fallbackRoadmap(idea);
      }
    } catch (error) {
      console.error('Roadmap generation failed:', error);
      return this.fallbackRoadmap(idea);
    }
  }

  private static fallbackRoadmap(idea: string): RoadmapStep[] {
    return [
      {
        week: 1,
        title: 'Project Setup and Planning',
        description: 'Set up development environment, define requirements, and create project structure.',
        tasks: [
          'Initialize git repository',
          'Choose tech stack',
          'Set up database',
          'Create project plan',
        ],
        status: 'pending',
      },
      {
        week: 2,
        title: 'Core Feature Implementation',
        description: 'Implement the main functionality of the application.',
        tasks: [
          'Develop core features',
          'Create database models',
          'Implement API endpoints',
          'Write basic tests',
        ],
        status: 'pending',
      },
      {
        week: 3,
        title: 'UI/UX and Integration',
        description: 'Build user interface and integrate with backend.',
        tasks: [
          'Design UI components',
          'Implement frontend logic',
          'Connect to API',
          'Add styling and responsiveness',
        ],
        status: 'pending',
      },
      {
        week: 4,
        title: 'Testing and Deployment',
        description: 'Test thoroughly and deploy to production.',
        tasks: [
          'Write integration tests',
          'Perform user acceptance testing',
          'Fix bugs',
          'Deploy to hosting platform',
        ],
        status: 'pending',
      },
    ];
  }

  /**
   * Update a roadmap step's status (frontend helper).
   */
  static updateStepStatus(steps: RoadmapStep[], week: number, status: 'pending' | 'in-progress' | 'completed'): RoadmapStep[] {
    return steps.map(step => (step.week === week ? { ...step, status } : step));
  }
}
