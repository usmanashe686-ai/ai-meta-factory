import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai/service';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate component using AI service
    const result = await aiService.generateComponent(prompt);

    return NextResponse.json({
      success: result.success,
      component: result.component,
      timestamp: new Date().toISOString(),
      ...(result.error && { warning: result.error })
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
      { status: 200 } // Return 200 with fallback instead of 500
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
