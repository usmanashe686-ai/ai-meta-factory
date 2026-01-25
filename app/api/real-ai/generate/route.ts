import { NextRequest, NextResponse } from 'next/server';
import { realAIPipeline } from '@/lib/ai/real-pipeline';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting real AI generation for:', prompt);
    
    // Generate component using real AI pipeline
    const component = await realAIPipeline.generateComponent(prompt);

    console.log('✅ AI generation complete:', component.type);
    
    return NextResponse.json({
      success: true,
      component,
      timestamp: new Date().toISOString(),
      pipeline: 'OpenAI → DeepSeek → Gemini'
    });
  } catch (error) {
    console.error('❌ Real AI API error:', error);
    
    // Fallback to simpler generation
    const fallbackComponent = {
      type: 'card',
      content: 'AI Generated Component',
      styles: {
        backgroundColor: '#f8fafc',
        color: '#334155',
        fontSize: 18,
        borderRadius: 12,
        width: '300px',
        height: '180px',
        padding: '24px',
        margin: '8px'
      },
      code: `<div className="p-6 bg-white rounded-xl shadow-lg">
  <h3 className="text-xl font-bold">AI Generated Component</h3>
  <p className="text-gray-600">Created with Meta Factory AI</p>
</div>`,
      description: 'Fallback AI component'
    };

    return NextResponse.json({
      success: false,
      component: fallbackComponent,
      error: error instanceof Error ? error.message : 'AI generation failed',
      timestamp: new Date().toISOString(),
      pipeline: 'Fallback'
    });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Meta Factory Real AI Pipeline',
    status: 'active',
    version: '1.0.0',
    apis: ['OpenAI', 'DeepSeek', 'Gemini'],
    endpoints: {
      POST: '/api/real-ai/generate'
    },
    note: 'Check environment variables for API keys'
  });
}
