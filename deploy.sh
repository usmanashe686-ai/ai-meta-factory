#!/bin/bash

# 🚀 AI Meta Factory Deployment Script
set -e

echo "🚀 Starting AI Meta Factory deployment..."

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ ERROR: OPENAI_API_KEY environment variable is not set"
    echo ""
    echo "To set it up:"
    echo "1. Get your OpenAI API key from: https://platform.openai.com/api-keys"
    echo "2. Set it in Vercel:"
    echo "   vercel env add OPENAI_API_KEY"
    echo "3. Or set it locally (for testing):"
    echo "   export OPENAI_API_KEY=sk-your-key-here"
    echo ""
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type check
echo "🔍 Type checking..."
npx tsc --noEmit

# Build
echo "🏗️ Building..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""
echo "🎉 AI Meta Factory is ready!"
echo ""
echo "To start the development server:"
echo "   npm run dev"
echo ""
echo "To deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "✨ Open http://localhost:3000 to start generating AI code!"
