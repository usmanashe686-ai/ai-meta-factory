import { OpenAI } from 'openai'
import { Template, TemplateComponent } from '@/lib/templates/template.types'

interface TemplateGenerationRequest {
  category: string
  description: string
  complexity: 'simple' | 'moderate' | 'complex'
  style: 'modern' | 'minimal' | 'corporate' | 'creative'
  features: string[]
}

export class AITemplateGenerator {
  private openai: OpenAI
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })
  }

  async generateTemplate(request: TemplateGenerationRequest): Promise<Template> {
    const prompt = this.buildTemplatePrompt(request)
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a professional UI/UX designer and frontend developer. Generate complete template specifications including components, layout, and styling. Return valid JSON only.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    })

    const templateData = JSON.parse(response.choices[0].message.content || '{}')
    
    return this.formatTemplate(templateData, request)
  }

  private buildTemplatePrompt(request: TemplateGenerationRequest): string {
    return `
      Generate a ${request.complexity} ${request.category} template with ${request.style} style.
      
      Requirements:
      - Category: ${request.category}
      - Description: ${request.description}
      - Complexity: ${request.complexity}
      - Style: ${request.style}
      - Features: ${request.features.join(', ')}
      
      Generate a complete template specification including:
      1. Template name and description
      2. List of components with their properties
      3. Layout structure
      4. Color palette
      5. Typography settings
      6. Suggested interactions
      7. SEO meta tags
      8. Mobile responsiveness strategy
      
      Return as JSON matching this structure:
      {
        "name": "Template Name",
        "description": "Detailed description",
        "components": [
          {
            "id": "unique-id-1",
            "type": "container",
            "props": { 
              "className": "container mx-auto p-4",
              "children": []
            },
            "position": { "x": 0, "y": 0 }
          }
        ],
        "styles": {
          "colors": { 
            "primary": "#3B82F6", 
            "secondary": "#10B981",
            "background": "#FFFFFF",
            "text": "#1F2937"
          },
          "typography": { 
            "fontFamily": "Inter, sans-serif",
            "headingSize": "2rem",
            "bodySize": "1rem"
          }
        },
        "metadata": {
          "estimatedBuildTime": "2 hours",
          "difficulty": "${request.complexity}",
          "dependencies": ["react", "tailwindcss"]
        }
      }
    `
  }

  private formatTemplate(templateData: any, request: TemplateGenerationRequest): Template {
    return {
      id: `generated_${Date.now()}`,
      name: templateData.name || `${request.category} Template`,
      description: templateData.description || request.description,
      previewImage: '', // Will be generated later
      components: templateData.components || [],
      category: request.category as any,
      difficulty: request.complexity === 'simple' ? 'beginner' : 
                  request.complexity === 'moderate' ? 'intermediate' : 'advanced',
      tags: [...request.features, request.style, request.category],
      author: {
        id: 'ai-generator',
        name: 'AI Generator',
        avatar: '/ai-avatar.png',
        verified: true,
        templateCount: 1000,
        rating: 4.8
      },
      rating: 4.5,
      reviewCount: 0,
      usageCount: 0,
      price: 'free',
      license: 'MIT',
      createdAt: new Date(),
      updatedAt: new Date(),
      dependencies: templateData.metadata?.dependencies || [],
      estimatedBuildTime: templateData.metadata?.estimatedBuildTime || '2 hours'
    }
  }

  async generateFromImage(imageUrl: string): Promise<Template> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: `Analyze this UI design image and generate a template specification from it. 
                Provide the following in JSON format:
                1. Template name and description
                2. List of main components
                3. Color palette used
                4. Layout structure
                5. Typography styles
                6. Estimated complexity (simple/moderate/complex)
                Return only valid JSON.`
              },
              { 
                type: 'image_url', 
                image_url: { url: imageUrl } 
              }
            ]
          }
        ],
        max_tokens: 1000
      })

      const visionData = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        id: `vision_${Date.now()}`,
        name: visionData.name || 'Image Generated Template',
        description: visionData.description || 'Generated from image analysis',
        previewImage: imageUrl,
        components: visionData.components || [],
        category: 'dashboard', // Default category
        difficulty: this.mapComplexity(visionData.complexity),
        tags: ['ai-generated', 'from-image', visionData.style || 'modern'],
        author: {
          id: 'ai-vision',
          name: 'AI Vision',
          avatar: '/ai-vision.png',
          verified: true,
          templateCount: 500,
          rating: 4.9
        },
        rating: 4.7,
        reviewCount: 0,
        usageCount: 0,
        price: 'free',
        license: 'MIT',
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: ['react', 'tailwindcss'],
        estimatedBuildTime: '3 hours'
      }
    } catch (error) {
      console.error('Image generation error:', error)
      throw new Error('Failed to generate template from image')
    }
  }

  private mapComplexity(complexity: string): 'beginner' | 'intermediate' | 'advanced' {
    switch (complexity?.toLowerCase()) {
      case 'simple': return 'beginner'
      case 'moderate': return 'intermediate'
      case 'complex': return 'advanced'
      default: return 'intermediate'
    }
  }

  async customizeTemplate(template: Template, customizations: any): Promise<Template> {
    const prompt = `
      Customize this template based on user requests:
      
      Original Template: ${JSON.stringify(template, null, 2)}
      
      Customizations requested:
      ${JSON.stringify(customizations, null, 2)}
      
      Return the updated template in the same JSON structure.
    `

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const updatedData = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      ...template,
      ...updatedData,
      updatedAt: new Date()
    }
  }
}
