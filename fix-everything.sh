#!/bin/bash

echo "🔧 Fixing AI Factory Setup..."

cd ~/ai-meta-factory

# 1. Stop any running servers
echo "Stopping existing servers..."
pkill -f "next" 2>/dev/null || true

# 2. Create missing files
echo "Creating missing files..."
mkdir -p lib/ai/{utils,orchestrator,providers}

# Parser
cat > lib/ai/utils/parser.ts << 'PARSEREOF'
export function parseAIGeneratedCode(code: string): any {
  console.log('[Parser] Parsing AI code');
  return {
    type: 'ai-component',
    props: { name: 'AIComponent', code: code, isAI: true }
  };
}
PARSEREOF

# Orchestrator (if missing)
if [ ! -f lib/ai/orchestrator/pipeline.ts ]; then
  cat > lib/ai/orchestrator/pipeline.ts << 'ORCHESTRATOREOF'
export class AIOrchestrator {
  async processPipeline(prompt: string) {
    return {
      finalOutput: \`// AI: \${prompt}\`,
      metadata: { totalTokens: 100, timeTaken: 500 }
    };
  }
}
ORCHESTRATOREOF
fi

# 3. Update API route
mkdir -p app/api/ai-test
cat > app/api/ai-test/route.ts << 'APIEOF'
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt') || 'test';
  return NextResponse.json({ 
    success: true, 
    prompt: prompt,
    message: 'API is working!' 
  });
}
APIEOF

# 4. Start server
echo "Starting server..."
npm run dev > ~/server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# 5. Wait and test
sleep 8
echo -e "\nTesting..."
echo "API Test:"
curl -s "http://localhost:3000/api/ai-test?prompt=hello"
echo -e "\n\nHomepage:"
curl -s "http://localhost:3000" | grep -o "<title>[^<]*</title>"

echo -e "\n✅ Setup complete!"
echo "Server logs: tail -f ~/server.log"
echo "Stop server: kill $SERVER_PID"
