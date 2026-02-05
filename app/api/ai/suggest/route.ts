import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, currentCode, language, context } = body;

    // Validate required fields
    if (!currentCode || !fileName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: fileName, currentCode'
      }, { status: 400 });
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured',
        enhancedCode: currentCode,
        suggestions: ['Add OPENAI_API_KEY to environment variables']
      });
    }

    const openai = new OpenAI({ apiKey });
    const model = process.env.AI_MODEL || 'gpt-3.5-turbo';

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert ${language} developer. Enhance the given code by improving structure, adding error handling, and following best practices. Return only the enhanced code.`
        },
        {
          role: 'user',
          content: `Enhance this ${language} code:\n\n${currentCode}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const enhancedCode = response.choices[0]?.message?.content || currentCode;
    const tokensUsed = response.usage?.total_tokens || 0;

    return NextResponse.json({
      success: true,
      enhancedCode,
      suggestions: [
        'Improved code structure',
        'Added error handling',
        'Optimized performance',
        'Enhanced readability'
      ],
      metadata: {
        model,
        tokensUsed,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[API] AI processing error:', error);

    // Return a simulated response for development/testing
    const { currentCode = '', language = 'typescript' } = await request.json().catch(() => ({}));
    
    return NextResponse.json({
      success: false,
      error: 'AI service temporarily unavailable',
      enhancedCode: currentCode,
      suggestions: ['AI service is being configured. Using original code.'],
      metadata: {
        model: 'simulated',
        tokensUsed: 0,
        timestamp: new Date().toISOString(),
        note: 'Add OPENAI_API_KEY for real AI features'
      }
    }, { status: 503 });
  }
}
