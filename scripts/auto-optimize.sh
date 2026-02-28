#!/bin/bash
# Run build with optimizations and bundle analysis

set -e

echo "🔧 Running Next.js build with optimizations..."
npm run build

echo "📊 Generating bundle analysis..."
npx @next/bundle-analyzer

# Optionally run the image optimizer if sharp is installed
if command -v sharp &> /dev/null; then
  echo "🖼️ Optimizing images..."
  node backend/services/export-service/src/optimizer.js
else
  echo "⚠️ Sharp not installed – skipping image optimization."
fi

echo "✅ Optimization complete."
