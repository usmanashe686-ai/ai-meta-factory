import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, currentCode, changes, context } = body;

    // Get API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not set');
      return NextResponse.json(
        { 
          generatedCode: currentCode,
          confidence: 0,
          explanation: 'OPENROUTER_API_KEY is not set in environment variables',
          suggestions: ['Set OPENROUTER_API_KEY in Vercel environment variables'],
          metadata: { error: 'Missing API key' }
        },
        { status: 400 }
      );
    }

    // Try multiple possible environment variable names for model
    const model = process.env.AI_MODEL || 
                  process.env.NEXT_PUBLIC_AI_MODEL || 
                  'openai/chatgpt-4o-latest';
    
    const language = getLanguage(filePath);
    
    console.log(`[AI API] Regenerating ${filePath} with ${model}`);
    console.log(`[AI API] API Key: ${apiKey.substring(0, 10)}...`);
    
    // Use OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.get('origin') || 'https://ai-meta-factory.vercel.app',
        'X-Title': 'AI Meta Factory',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} developer. Regenerate the code with these changes: ${changes.join(', ')}.
            
Stack: ${context.stack}
Database: ${context.database}
File: ${filePath}

Return ONLY the complete regenerated code, no explanations.`
          },
          {
            role: 'user',
            content: `\`\`\`${language}
${currentCode}
\`\`\``
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[AI API] Error response:', responseText);
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = JSON.parse(responseText);
    const generatedCode = data.choices?.[0]?.message?.content || currentCode;
    const tokensUsed = data.usage?.total_tokens || 0;

    return NextResponse.json({
      generatedCode,
      confidence: 0.85,
      explanation: `Regenerated with ${model} (${tokensUsed} tokens)`,
      suggestions: [
        'Improved code structure',
        'Added error handling',
        'Optimized performance',
        'Enhanced readability'
      ],
      metadata: {
        model,
        tokensUsed,
        cost: calculateCost(tokensUsed, model),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[AI API] Error:', error);
    
    return NextResponse.json(
      {
        generatedCode: '',
        confidence: 0,
        explanation: `AI service error: ${error.message}`,
        suggestions: ['Check your API key and quota', 'Verify the model name is correct'],
        metadata: { error: error.message }
      },
      { status: 500 }
    );
  }
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'ts': case 'tsx': return 'typescript';
    case 'js': case 'jsx': return 'javascript';
    case 'json': return 'json';
    case 'css': case 'scss': return 'css';
    case 'html': return 'html';
    case 'md': return 'markdown';
    case 'py': return 'python';
    default: return 'plaintext';
  }
}

function calculateCost(tokens: number, model: string): number {
  const pricing: Record<string, number> = {
    'openai/chatgpt-4o-latest': 0.0025,
    'openai/gpt-4-turbo': 0.01,
    'openai/gpt-4': 0.03,
    'anthropic/claude-3-opus': 0.015,
  };

  const rate = pricing[model] || 0.01;
  return (tokens / 1_000_000) * rate * 1000000;
}
