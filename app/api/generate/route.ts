import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503 }
      );
    }

    const { prompt, framework = 'nextjs', language = 'typescript' } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a senior ${framework} developer.
Generate production-ready ${language} code based on the user's description.
Return ONLY a JSON object with this structure:
{
  "files": [
    {
      "name": "filename.extension",
      "content": "full file content here"
    }
  ],
  "description": "brief description"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(response);
    
    return NextResponse.json({
      success: true,
      files: parsed.files || [],
      description: parsed.description || '',
      metadata: {
        tokensUsed: completion.usage?.total_tokens || 0,
        model: 'gpt-4o-mini'
      }
    });

  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json(
      { error: 'Generation failed', details: error.message },
      { status: 500 }
    );
  }
}
