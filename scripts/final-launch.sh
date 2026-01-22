#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 WEEK 6 - DAY 6: FINAL LAUNCH PREPARATION"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "${BLUE}1. FINAL BUILD CHECK${NC}"
echo "====================="

# Check current directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Not in project directory${NC}"
  exit 1
fi

# Build the project
echo "Building project..."
NEXT_DISABLE_SWC=1 npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build successful${NC}"
  
  # Check bundle size
  if [ -d ".next" ]; then
    SIZE=$(du -sh .next | cut -f1)
    echo "   Build size: $SIZE"
    
    if [[ $SIZE == *"M"* ]]; then
      SIZE_NUM=$(echo $SIZE | sed 's/M//')
      if (( $(echo "$SIZE_NUM > 10" | bc -l) )); then
        echo -e "${YELLOW}⚠️  Build size is large ($SIZE). Consider optimization.${NC}"
      fi
    fi
  fi
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

echo ""
echo "${BLUE}2. DEPLOYMENT CHECK${NC}"
echo "===================="

# Check Firebase deployment readiness
if command -v firebase &> /dev/null; then
  echo "Checking Firebase project..."
  firebase projects:list 2>/dev/null | grep -q "usman-umer"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Firebase project configured${NC}"
  else
    echo -e "${YELLOW}⚠️  Firebase project not found or not logged in${NC}"
    echo "   Run: firebase login --no-localhost"
  fi
else
  echo -e "${RED}❌ Firebase CLI not installed${NC}"
fi

echo ""
echo "${BLUE}3. LAUNCH CHECKLIST${NC}"
echo "====================="

check_item() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
  fi
}

# Run checks
echo "Checking critical components..."

# Check 1: Homepage exists
[ -f "app/page.tsx" ] || [ -f "pages/index.js" ]
check_item $? "Homepage exists"

# Check 2: Builder page exists
[ -f "app/builder/[id]/page.tsx" ] || [ -f "pages/builder/[id].js" ]
check_item $? "Builder page exists"

# Check 3: Firebase config exists
[ -f "firebase.json" ]
check_item $? "Firebase configuration exists"

# Check 4: Environment file exists
[ -f ".env.local" ]
check_item $? "Environment configuration exists"

# Check 5: Build directory exists
[ -d ".next" ] || [ -d "out" ]
check_item $? "Build directory exists"

echo ""
echo "${BLUE}4. PERFORMANCE CHECK${NC}"
echo "======================"

# Simple performance check
if command -v curl &> /dev/null; then
  echo "Testing site response time..."
  START_TIME=$(date +%s%N)
  curl -s -o /dev/null "https://usman-umer.web.app"
  END_TIME=$(date +%s%N)
  
  DURATION_MS=$((($END_TIME - $START_TIME) / 1000000))
  
  if [ $DURATION_MS -lt 1000 ]; then
    echo -e "${GREEN}✅ Response time: ${DURATION_MS}ms${NC}"
  elif [ $DURATION_MS -lt 3000 ]; then
    echo -e "${YELLOW}⚠️  Response time: ${DURATION_MS}ms (acceptable)${NC}"
  else
    echo -e "${RED}❌ Response time: ${DURATION_MS}ms (slow)${NC}"
  fi
fi

echo ""
echo "${BLUE}5. FINAL DEPLOYMENT${NC}"
echo "===================="

read -p "Deploy to production? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Deploying to Firebase Hosting..."
  firebase deploy --only hosting
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
    echo "=============================="
    echo ""
    echo "${BLUE}🌐 YOUR AI META-FACTORY IS LIVE AT:${NC}"
    echo "   ${GREEN}https://usman-umer.web.app${NC}"
    echo ""
    echo "${BLUE}📊 NEXT STEPS:${NC}"
    echo "1. Test all user flows"
    echo "2. Monitor Firebase Console for errors"
    echo "3. Share with beta testers"
    echo "4. Set up custom domain (optional)"
    echo "5. Begin Week 7: User Acquisition"
    echo ""
    echo "${GREEN}Allahumma barik! You've built something amazing!${NC}"
    
    # Open the site
    if command -v termux-open-url &> /dev/null; then
      termux-open-url "https://usman-umer.web.app"
    fi
  else
    echo -e "${RED}❌ Deployment failed${NC}"
  fi
else
  echo -e "${YELLOW}Deployment cancelled${NC}"
fi

echo ""
echo "${BLUE}6. POST-LAUNCH MONITORING${NC}"
echo "============================="

# Create monitoring script
cat > scripts/monitor-production.sh << 'MONITOR'
#!/data/data/com.termux/files/usr/bin/bash

echo "📊 PRODUCTION MONITORING"
echo "======================"
echo "Site: https://usman-umer.web.app"
echo "Time: \$(date)"
echo ""

# Check site status
echo "1. Site Health Check:"
STATUS_CODE=\$(curl -s -o /dev/null -w "%{http_code}" https://usman-umer.web.app)
if [ "\$STATUS_CODE" = "200" ]; then
  echo "   ✅ Site is up (HTTP \$STATUS_CODE)"
else
  echo "   ❌ Site is down (HTTP \$STATUS_CODE)"
fi

# Check response time
echo "2. Performance:"
START=\$(date +%s%N)
curl -s -o /dev/null https://usman-umer.web.app
END=\$(date +%s%N)
DURATION=\$(((\$END - \$START) / 1000000))
echo "   Response time: \${DURATION}ms"

# Check SSL
echo "3. Security:"
if curl -s -I https://usman-umer.web.app 2>/dev/null | grep -q "200"; then
  echo "   ✅ HTTPS working"
else
  echo "   ❌ HTTPS issues"
fi

# Resource check
echo "4. System Resources:"
echo "   Disk: \$(df -h ~ | awk 'NR==2 {print \$4 " free"}')"
echo "   RAM: \$(free -m | awk 'NR==2 {print \$3 "MB used"}')"

echo ""
echo "🔧 Quick Commands:"
echo "   View logs: firebase hosting:channel:open"
echo "   Rollback: firebase hosting:rollback"
echo "   Analytics: firebase open analytics"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""
MONITOR

chmod +x scripts/monitor-production.sh

echo -e "${GREEN}✅ Monitoring script created${NC}"
echo "Run: ./scripts/monitor-production.sh"
echo ""
echo "${BLUE}📈 LAUNCH COMPLETE!${NC}"
echo "====================="
