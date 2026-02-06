import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This endpoint should only work in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY 
      ? `Set (first 10 chars: ${process.env.OPENROUTER_API_KEY.substring(0, 10)}...)` 
      : 'Not set',
    AI_MODEL: process.env.AI_MODEL || 'Not set',
    NEXT_PUBLIC_AI_MODEL: process.env.NEXT_PUBLIC_AI_MODEL || 'Not set',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID 
      ? `Set (first 10 chars: ${process.env.GITHUB_CLIENT_ID.substring(0, 10)}...)`
      : 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET 
      ? 'Set (hidden)' 
      : 'Not set',
    DATABASE_URL: process.env.DATABASE_URL 
      ? 'Set (hidden)'
      : 'Not set',
  };

  return NextResponse.json({
    message: 'Environment Variables Debug',
    environment: envVars,
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries())
  });
}
