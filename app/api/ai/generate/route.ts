import { NextRequest, NextResponse } from 'next/server';
import { aiPipeline } from '@/lib/ai/pipeline';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate component using AI pipeline
    const component = await aiPipeline.generateComponent(prompt);

    return NextResponse.json({
      success: true,
      component,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate component',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Meta Factory AI Generator',
    status: 'active',
    endpoints: ['POST /api/ai/generate'],
    version: '1.0.0'
  });
}
