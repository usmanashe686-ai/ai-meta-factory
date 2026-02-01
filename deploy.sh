#!/bin/bash

echo "🚀 AI Meta Factory Deployment Script"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Initializing..."
    git init
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
else
    echo "📦 Staging changes..."
    git add .
    
    echo "💾 Committing changes..."
    git commit -m "Deploy AI Meta Factory with APK export feature
    
    - Complete UI builder with 5 tabs
    - 7 tech stacks + 7 databases + 7 deployment providers
    - AI Component Generator with Gemini/OpenAI
    - Full-Stack Factory with 4-step visualization
    - GitHub integration ready
    - Project export with ZIP download
    - APK export for mobile platforms
    - Registry system with compatibility validation
    - Enhanced stack selector
    - Production-ready architecture"
fi

echo ""
echo "🌐 DEPLOYMENT OPTIONS:"
echo ""
echo "1. DEPLOY TO VERCEL (Recommended):"
echo "   a. Push to GitHub first:"
echo "      git remote add origin https://github.com/YOUR_USERNAME/ai-meta-factory.git"
echo "      git branch -M main"
echo "      git push -u origin main"
echo ""
echo "   b. Then deploy on Vercel:"
echo "      - Go to https://vercel.com/new"
echo "      - Import from GitHub"
echo "      - Add environment variables:"
echo "        • GEMINI_API_KEY"
echo "        • OPENAI_API_KEY (optional)"
echo "      - Deploy!"
echo ""
echo "2. DEPLOY LOCALLY FOR TESTING:"
echo "   npm run dev"
echo "   # Open http://localhost:3000"
echo ""
echo "3. BUILD FOR PRODUCTION:"
echo "   npm run build"
echo "   npm start"
echo ""
echo "📱 APK EXPORT NOTE:"
echo "   - APK generation in production requires additional setup"
echo "   - For real APK builds, consider using:"
echo "     • GitHub Actions for CI/CD"
echo "     • Expo EAS for cloud builds"
echo "     • Local build servers"
echo ""
echo "✅ Your AI Meta Factory is ready to deploy!"
