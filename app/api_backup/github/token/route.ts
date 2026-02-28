import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // For demo purposes, return a mock token
    // In production, exchange code for token with GitHub OAuth
    const mockToken = 'github_mock_token_' + Math.random().toString(36).substring(7);

    return NextResponse.json({
      access_token: mockToken,
      token_type: 'bearer',
      scope: 'repo,user',
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to exchange code for token',
      details: error.message,
    }, { status: 500 });
  }
}
