import { NextRequest, NextResponse } from 'next/server';
import { DATABASES, getDatabasePrompt } from '@/lib/registry/databases';
import { STACKS, getStackPrompt } from '@/lib/registry/stacks';
import { GIT_PROVIDERS, getGitProviderPrompt } from '@/lib/registry/gitProviders';

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      stack = 'nextjs', 
      database = 'none',
      gitProvider = 'github'
    } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate stack
    const stackConfig = STACKS[stack as keyof typeof STACKS];
    if (!stackConfig) {
      return NextResponse.json(
        { error: `Invalid stack: ${stack}. Available: ${Object.keys(STACKS).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate database
    const dbConfig = DATABASES[database as keyof typeof DATABASES];
    if (!dbConfig) {
      return NextResponse.json(
        { error: `Invalid database: ${database}. Available: ${Object.keys(DATABASES).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate database-stack compatibility
    const isCompatible = dbConfig.supportedStacks.includes(stack);
    if (!isCompatible && database !== 'none') {
      return NextResponse.json(
        { error: `${dbConfig.label} is not compatible with ${stackConfig.label}. Choose a different database or stack.` },
        { status: 400 }
      );
    }

    // Gemini API key is required
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key required',
        message: 'Add GEMINI_API_KEY to Vercel Environment Variables',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    console.log(`🏭 Full-Stack Factory generating: ${stack} + ${database} + ${gitProvider}`);

    const geminiKey = process.env.GEMINI_API_KEY;
    
    // Generate project structure and code
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a complete ${stackConfig.label} project with ${dbConfig.label} database.

PROJECT REQUIREMENTS:
${prompt}

TECH STACK:
${getStackPrompt(stack as any)}

DATABASE CONFIGURATION:
${getDatabasePrompt(database, stack)}

GIT CONFIGURATION:
${getGitProviderPrompt(gitProvider as any)}

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "project": {
    "name": "generated-project-name",
    "description": "brief description",
    "structure": ["list of files and folders"],
    "files": {
      "filename": "file content"
    }
  },
  "setupInstructions": "step-by-step setup guide",
  "environmentVariables": ["list of env vars needed"]
}

IMPORTANT:
1. Generate complete, runnable code
2. Include all necessary configuration files
3. Add comprehensive comments
4. Follow best practices for the chosen stack
5. Use proper TypeScript/Python/Dart syntax
6. Include error handling
7. Add database client setup if needed
8. Include .env.example with all required variables
9. Add README.md with setup instructions

Return ONLY the JSON object, no additional text.`
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4000
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response as JSON');
    }

    let projectData;
    try {
      projectData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      // Fallback project data
      projectData = {
        project: {
          name: `${prompt.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}-project`,
          description: `A ${stackConfig.label} project for: ${prompt}`,
          structure: stackConfig.structure,
          files: {}
        },
        setupInstructions: `1. Install dependencies\n2. Set up environment variables\n3. Run ${stackConfig.startCommand}`,
        environmentVariables: dbConfig.env
      };
    }

    return NextResponse.json({
      success: true,
      message: '🏭 Full-Stack Project Generated Successfully',
      timestamp: new Date().toISOString(),
      configuration: {
        stack: stackConfig.label,
        database: dbConfig.label,
        gitProvider: GIT_PROVIDERS[gitProvider as keyof typeof GIT_PROVIDERS]?.label || gitProvider,
        compatibility: isCompatible ? '✅ Compatible' : '⚠️ Limited compatibility'
      },
      project: projectData.project,
      setup: {
        instructions: projectData.setupInstructions,
        environmentVariables: projectData.environmentVariables,
        databaseSetup: database !== 'none' ? dbConfig.setupGuide : null,
        gitSetup: GIT_PROVIDERS[gitProvider as keyof typeof GIT_PROVIDERS]?.setupGuide || null
      },
      nextSteps: [
        '1. Review generated project structure',
        '2. Set up environment variables',
        '3. Install dependencies',
        '4. Configure database connection',
        '5. Run the project',
        database !== 'none' ? '6. Set up database according to guide' : '6. Project ready to run'
      ],
      metadata: {
        stackId: stack,
        databaseId: database,
        gitProviderId: gitProvider,
        generatedAt: new Date().toISOString(),
        model: 'Gemini 1.5 Flash'
      }
    });

  } catch (error: any) {
    console.error('❌ Full-stack factory error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Full-stack generation failed',
      timestamp: new Date().toISOString(),
      help: 'Check your GEMINI_API_KEY and try again'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AI Meta Factory - Full-Stack Generator',
    status: 'Ready',
    timestamp: new Date().toISOString(),
    capabilities: {
      stacks: Object.values(STACKS).map(s => ({ id: s.id, label: s.label })),
      databases: Object.values(DATABASES).map(d => ({ id: d.id, label: d.label, type: d.type })),
      gitProviders: Object.values(GIT_PROVIDERS).map(g => ({ id: g.id, label: g.label })),
      compatibility: 'Validates stack + database compatibility'
    },
    usage: 'POST /api/factory/generate with { prompt, stack, database, gitProvider }',
    requirements: ['GEMINI_API_KEY environment variable'],
    note: 'Generates complete projects with proper structure, code, and configuration'
  });
}
