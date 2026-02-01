#!/bin/bash

echo "🔍 AI META FACTORY DEPLOYMENT DIAGNOSTIC"
echo "========================================"

# Check local files
echo ""
echo "📁 LOCAL FILE CHECK:"
echo "Root page size: $(wc -c < app/page.tsx) bytes"
echo "Builder page size: $(wc -c < app/builder/page.tsx) bytes"
echo ""

# Check what's in the root page
echo "📄 ROOT PAGE PREVIEW (first 5 lines):"
head -5 app/page.tsx
echo ""

# Test deployed content
echo "🌐 DEPLOYED CONTENT TEST:"
echo "Testing root URL: https://ai-meta-factory-chi.vercel.app"
echo ""
curl -s https://ai-meta-factory-chi.vercel.app | grep -o "<title>[^<]*</title>\|<h1[^>]*>[^<]*</h1>\|AI Meta Factory\|Coming soon" | head -10
echo ""
echo "Testing builder URL: https://ai-meta-factory-chi.vercel.app/builder"
BUILDER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://ai-meta-factory-chi.vercel.app/builder)
echo "Builder HTTP Status: $BUILDER_STATUS"
if [ "$BUILDER_STATUS" = "200" ]; then
    echo "Builder page is accessible"
else
    echo "❌ Builder page not accessible"
fi

# Check Vercel deployment
echo ""
echo "🚀 VERCEL DEPLOYMENT INFO:"
if command -v vercel &> /dev/null; then
    vercel ls 2>/dev/null | grep -A2 -B2 "ai-meta-factory" || echo "Could not find project"
else
    echo "Vercel CLI not available"
fi

echo ""
echo "🔧 BUILD CHECK:"
if [ -f ".next/BUILD_ID" ]; then
    echo "Build exists locally"
    cat .next/BUILD_ID
else
    echo "❌ No local build found"
fi

echo ""
echo "========================================"
echo "🔍 DIAGNOSIS COMPLETE"
