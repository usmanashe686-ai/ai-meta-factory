#!/data/data/com.termux/files/usr/bin/bash

echo "🔍 DEPLOYMENT DEBUG SCRIPT"
echo "=========================="

cd ~/ai-meta-factory

echo "1. Checking Git Status..."
git status --short

echo ""
echo "2. Checking App Structure..."
if [ -f "app/builder/page.tsx" ]; then
  echo "✅ Builder page exists"
  echo "   Lines: $(wc -l < app/builder/page.tsx)"
else
  echo "❌ Builder page missing!"
fi

if [ -f "app/dashboard/page.tsx" ]; then
  echo "✅ Dashboard page exists"
else
  echo "❌ Dashboard page missing!"
fi

echo ""
echo "3. Checking Firebase Project..."
firebase projects:list

echo ""
echo "4. Current Deployment URL..."
echo "   https://usman-umer.web.app"

echo ""
echo "5. Building..."
NEXT_DISABLE_SWC=1 npm run build 2>&1 | tail -20

echo ""
echo "6. Deploying..."
firebase deploy --only hosting --force

echo ""
echo "7. Opening Site..."
termux-open-url "https://usman-umer.web.app?debug=$(date +%s)"

echo ""
echo "✅ DEBUG COMPLETE!"
