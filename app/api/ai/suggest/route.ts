import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'AI Service Unavailable',
          message: 'OpenAI API key not configured. Add OPENAI_API_KEY to Vercel environment variables.',
          code: 'AI_SERVICE_DISABLED'
        },
        { status: 503 }
      );
    }

    const { fileName, currentCode, language = 'typescript' } = await request.json();
    
    if (!fileName || !currentCode) {
      return NextResponse.json(
        { error: 'Missing fileName or currentCode' },
        { status: 400 }
      );
    }

    const prompt = `You are a senior ${language} developer.
Improve this code file: ${fileName}

REQUIREMENTS:
1. Keep original functionality
2. Add proper error handling
3. Add TypeScript types if applicable
4. Add useful comments
5. Follow best practices
6. Optimize for performance

ORIGINAL CODE:
${currentCode}

IMPROVED CODE (return ONLY code, no explanations):`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a senior software engineer. Always return ONLY code with no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const enhancedCode = completion.choices[0]?.message?.content?.trim() || currentCode;

    return NextResponse.json({
      success: true,
      enhancedCode,
      metadata: {
        fileName,
        language,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: 'gpt-4o-mini'
      }
    });

  } catch (error: any) {
    console.error('AI Enhancement Error:', error);
    
    return NextResponse.json(
      {
        error: 'AI Enhancement Failed',
        message: error.message || 'Unknown error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
