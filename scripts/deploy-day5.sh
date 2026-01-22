#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 DEPLOYING DAY 5: TEMPLATE ANALYTICS & USER FEEDBACK"
echo "======================================================="

cd ~/ai-meta-factory

# Install dependencies
echo "1. Installing dependencies..."
npm install recharts date-fns

# Build the application
echo "2. Building application..."
export NEXT_DISABLE_SWC=1
export NODE_OPTIONS="--max-old-space-size=1024"
npm run build

# Deploy to Firebase
echo "3. Deploying to Firebase..."
firebase deploy --only hosting

echo ""
echo "🎉 DAY 5 DEPLOYMENT COMPLETE!"
echo ""
echo "📊 NEW ANALYTICS FEATURES:"
echo "   • Template Analytics Tracking System"
echo "   • Real-time Usage Analytics Dashboard"
echo "   • User Review & Feedback System"
echo "   • Template Performance Metrics"
echo "   • Revenue Tracking"
echo "   • Template Details Page with Reviews"
echo ""
echo "🌐 Access your analytics dashboard at:"
echo "   https://usman-umer.web.app/dashboard/analytics"
echo ""
echo "📈 View template details at:"
echo "   https://usman-umer.web.app/templates/[template-id]"
