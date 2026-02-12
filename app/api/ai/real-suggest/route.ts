import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================
// 1. Validation Schema
// ============================================================
const RequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  context: z.string().optional(),
  language: z.string().default('typescript'),
  framework: z.string().default('react'),
  model: z.enum(['phi2', 'codellama', 'tinyllama', 'starcode']).default('phi2'),
  stream: z.boolean().default(false),
});

export type AIRequest = z.infer<typeof RequestSchema>;

// ============================================================
// 2. LOCAL MODEL CONFIGURATION
// ============================================================
const MODEL_MAPPING = {
  phi2: 'phi',
  codellama: 'codellama:7b',
  tinyllama: 'tinyllama',
  starcode: 'starcoder:3b',
};

// ============================================================
// 3. OLLAMA API CALL (LOCAL)
// ============================================================
async function callOllama(request: AIRequest) {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const modelName = MODEL_MAPPING[request.model];

  const prompt = request.context
    ? `Context: ${request.context}\n\nTask: ${request.prompt}\n\nGenerate only the ${request.language} code, no explanations:`
    : `${request.prompt}\n\nGenerate only the ${request.language} code, no explanations:`;

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      prompt: prompt,
      stream: request.stream,
      options: {
        temperature: 0.2,
        top_p: 0.95,
        stop: ['```', '\n\n\n'],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama error (${response.status}): ${error}`);
  }

  return response;
}

// ============================================================
// 4. FALLBACK: TRANSFORMERS.JS (EDGE/BROWSER)
// ============================================================
async function callTransformers(request: AIRequest) {
  // This runs on Edge Runtime or in‑browser – requires @xenova/transformers
  // For serverless, we recommend Ollama; this is a placeholder.
  throw new Error('Transformers.js fallback not implemented – please use Ollama');
}

// ============================================================
// 5. MAIN ROUTE HANDLER
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }
    const request = validation.data;

    // Call Ollama (local)
    let response: Response;
    try {
      response = await callOllama(request);
    } catch (ollamaError) {
      console.error('Ollama error, falling back to Transformers:', ollamaError);
      response = await callTransformers(request);
    }

    // Handle streaming response
    if (request.stream) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle non‑streaming response
    const data = await response.json();
    const generatedText = data.response || '';

    // Clean up code block markers
    const cleanCode = generatedText
      .replace(/^```[\w]*\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    return NextResponse.json({
      code: cleanCode,
      model: request.model,
      raw: generatedText,
    });
  } catch (error) {
    console.error('Local AI error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Edge runtime for lower latency
export const runtime = 'edge';
