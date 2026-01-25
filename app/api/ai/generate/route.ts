import { NextRequest, NextResponse } from 'next/server';

// Simple AI service - inline to avoid path issues
const aiService = {
  async generateComponent(prompt: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Determine component type from prompt
    const type = getComponentType(prompt);
    const colors = extractColors(prompt);
    
    return {
      success: true,
      component: {
        type,
        content: generateContent(prompt, type),
        styles: {
          backgroundColor: colors.background,
          color: colors.text,
          fontSize: getFontSize(type),
          borderRadius: getBorderRadius(type),
          width: getWidth(type),
          height: getHeight(type)
        },
        description: `AI-generated ${type} component`
      }
    };
  }
};

// Helper functions
function getComponentType(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('button') || promptLower.includes('btn')) return 'button';
  if (promptLower.includes('card') || promptLower.includes('box')) return 'card';
  if (promptLower.includes('input') || promptLower.includes('field')) return 'input';
  if (promptLower.includes('text') || promptLower.includes('para')) return 'text';
  if (promptLower.includes('header') || promptLower.includes('title')) return 'header';
  return 'card';
}

function extractColors(prompt: string): { background: string; text: string } {
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

  return { background: '#3b82f6', text: '#ffffff' };
}

function generateContent(prompt: string, type: string): string {
  const baseContent = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
  
  switch (type) {
    case 'button':
      return `Click: ${baseContent}`;
    case 'card':
      return `Card: ${baseContent}`;
    case 'input':
      return `Input: ${baseContent}`;
    case 'header':
      return `Header: ${baseContent}`;
    default:
      return baseContent;
  }
}

function getFontSize(type: string): number {
  const sizes: Record<string, number> = {
    'header': 32,
    'button': 16,
    'card': 18,
    'input': 14,
    'text': 16
  };
  return sizes[type] || 16;
}

function getBorderRadius(type: string): number {
  const radii: Record<string, number> = {
    'button': 8,
    'card': 12,
    'input': 6,
    'header': 0,
    'text': 0
  };
  return radii[type] || 8;
}

function getWidth(type: string): string {
  const widths: Record<string, string> = {
    'button': '140px',
    'card': '300px',
    'input': '250px',
    'header': '400px',
    'text': '350px'
  };
  return widths[type] || '300px';
}

function getHeight(type: string): string {
  const heights: Record<string, string> = {
    'button': '48px',
    'card': '180px',
    'input': '40px',
    'header': '80px',
    'text': '100px'
  };
  return heights[type] || '150px';
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

    const result = await aiService.generateComponent(prompt);

    return NextResponse.json({
      success: result.success,
      component: result.component,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate component',
        component: {
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
          description: 'Fallback component'
        }
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Meta Factory AI Generator',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      POST: '/api/ai/generate'
    }
  });
}
