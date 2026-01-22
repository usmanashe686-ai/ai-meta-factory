#!/data/data/com.termux/files/usr/bin/bash

echo "🌐 DEPLOYING AI META-FACTORY TO FIREBASE"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Firebase login
echo "1. Checking Firebase authentication..."
if firebase projects:list 2>/dev/null | grep -q "ai-meta-factory"; then
  echo -e "   ${GREEN}✅ Logged into Firebase${NC}"
else
  echo -e "   ${YELLOW}⚠️  Not logged in or project not found${NC}"
  echo "   Run: firebase login --no-localhost"
  read -p "   Press Enter to continue or Ctrl+C to cancel..."
fi

# Build the project
echo "2. Building project..."
bash scripts/build-production.sh

# Deploy to Firebase
echo "3. Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Get deployment URL
echo "4. Deployment complete!"
echo ""
echo -e "${GREEN}🚀 YOUR AI META-FACTORY IS NOW LIVE!${NC}"
echo ""
echo "📱 Test on these devices:"
echo "   • Mobile: $(termux-open-url https://ai-meta-factory.web.app 2>/dev/null && echo 'Opening...')"
echo "   • Desktop: https://ai-meta-factory.web.app"
echo ""
echo "🔧 Next steps:"
echo "   1. Test all user flows"
echo "   2. Check Firebase Console for errors"
echo "   3. Share with beta testers"
echo "   4. Monitor usage in Termux: pm2 logs"
