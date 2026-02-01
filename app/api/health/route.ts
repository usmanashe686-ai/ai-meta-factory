import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Check Gemini API key
  const geminiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || process.env.GOOGLE_API_KEY;
  const geminiConfigured = !!geminiKey;
  
  // Check OpenAI API key
  const openaiKey = process.env.OPENAI_API_KEY || process.env.Openai_APIKey;
  const openaiConfigured = !!openaiKey;
  
  // Check DeepSeek (disabled as per requirements)
  const deepseekConfigured = false;
  
  // Determine overall system status
  const isSystemReady = geminiConfigured;
  const systemStatus = isSystemReady ? '🚀 READY' : '🔴 CONFIGURATION REQUIRED';
  const systemMessage = isSystemReady 
    ? 'Gemini API key found. Ready for AI generation.'
    : 'Add GEMINI_API_KEY to Vercel Environment Variables. Get key from Google AI Studio.';
  
  const response = {
    timestamp: new Date().toISOString(),
    system: {
      status: systemStatus,
      message: systemMessage,
    },
    openai: {
      configured: openaiConfigured,
      status: openaiConfigured ? '✅ Optional enhancement ready' : '⏭️ Not configured (optional)',
    },
    gemini: {
      configured: geminiConfigured,
      keyFound: geminiConfigured,
      keySource: process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 
                 process.env.Gemini_API_KEY ? 'Gemini_API_KEY' : 
                 process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY' : 'Not found',
      status: geminiConfigured ? '✅ REQUIRED - Ready' : '❌ REQUIRED - Not configured',
    },
    deepseek: {
      configured: deepseekConfigured,
      status: '❌ Disabled - No client-side env access',
    },
    requirements: {
      required: ['Gemini 1.5 Flash'],
      optional: ['OpenAI GPT-4o Mini'],
      disabled: ['DeepSeek'],
    },
    runtime: {
      platform: 'Vercel',
      region: process.env.VERCEL_REGION || 'unknown',
      memory: process.env.VERCEL_RUNTIME_MEMORY || 'unknown',
    },
    responseTime: `${Date.now() - startTime}ms`,
  };
  
  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
