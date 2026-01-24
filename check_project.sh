#!/bin/bash

echo "🔍 META FACTORY AI BUILDER - PROJECT AUDIT"
echo "==========================================="

echo ""
echo "📁 DIRECTORY STRUCTURE:"
pwd
echo ""
echo "📦 PACKAGE.JSON:"
if [ -f "package.json" ]; then
  cat package.json | grep -A 20 -B 5 "dependencies\|scripts\|name"
else
  echo "❌ package.json not found!"
fi

echo ""
echo "⚛️ NEXT.JS CONFIG:"
if [ -f "next.config.js" ]; then
  echo "✅ next.config.js exists"
  head -20 next.config.js
elif [ -f "next.config.ts" ]; then
  echo "✅ next.config.ts exists"
  head -20 next.config.ts
else
  echo "❌ No Next.js config found"
fi

echo ""
echo "🎨 TAILWIND CONFIG:"
if [ -f "tailwind.config.js" ]; then
  echo "✅ tailwind.config.js exists"
  cat tailwind.config.js
elif [ -f "tailwind.config.ts" ]; then
  echo "✅ tailwind.config.ts exists"
  cat tailwind.config.ts
else
  echo "❌ No Tailwind config found"
fi

echo ""
echo "📁 APP DIRECTORY:"
ls -la app/ 2>/dev/null || echo "No app directory"

echo ""
echo "🛠️ COMPONENTS DIRECTORY:"
ls -la components/ 2>/dev/null || echo "No components directory"

echo ""
echo "🔧 DEPENDENCIES INSTALLED:"
npm list --depth=0 2>/dev/null | head -20 || echo "Could not check npm packages"

echo ""
echo "🌐 GIT STATUS:"
git status --short 2>/dev/null || echo "Not a git repository"

echo ""
echo "🚀 VERCEL DEPLOYMENT:"
if [ -f ".vercel/project.json" ]; then
  echo "✅ Vercel project found"
  jq -r '.orgId, .projectId' .vercel/project.json 2>/dev/null || cat .vercel/project.json
else
  echo "ℹ️ No .vercel directory found"
fi

echo ""
echo "🔥 FIREBASE SETUP:"
if [ -f "firebase.json" ]; then
  echo "✅ Firebase config exists"
elif [ -f ".env.local" ] && grep -q "FIREBASE" .env.local; then
  echo "✅ Firebase env variables found"
  grep "FIREBASE" .env.local
else
  echo "❌ Firebase not configured"
fi

echo ""
echo "📱 TERMUX INFO:"
echo "Node: $(node --version 2>/dev/null || echo 'Not found')"
echo "NPM: $(npm --version 2>/dev/null || echo 'Not found')"
echo "Git: $(git --version 2>/dev/null || echo 'Not found')"

echo ""
echo "==========================================="
