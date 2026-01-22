#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 DEPLOYING WEEK 4 FEATURES"
echo "============================="

cd ~/ai-meta-factory

# 1. Install new dependencies
echo "1. Installing new dependencies..."
npm install recharts date-fns react-color lucide-react

# 2. Set environment
export NEXT_DISABLE_SWC=1
export NODE_OPTIONS="--max-old-space-size=1024"

# 3. Clear caches
echo "2. Clearing caches..."
rm -rf .next out node_modules/.cache

# 4. Build
echo "3. Building application..."
npm run build

# 5. Deploy
echo "4. Deploying to Firebase..."
firebase deploy --only hosting

echo ""
echo "✅ WEEK 4 DEPLOYMENT COMPLETE!"
echo "📊 New Features Deployed:"
echo "   • AI Code Review System"
echo "   • Template Marketplace"
echo "   • AI Template Generator"
echo "   • Live Template Customizer"
echo "   • Analytics Dashboard"
echo ""
echo "🌐 Live at: https://usman-umer.web.app"
