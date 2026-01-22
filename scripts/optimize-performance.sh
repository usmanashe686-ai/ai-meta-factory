#!/data/data/com.termux/files/usr/bin/bash

echo "⚡ PERFORMANCE OPTIMIZATION SCRIPT"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${BLUE}1. Running Bundle Analysis...${NC}"
ANALYZE=true NEXT_DISABLE_SWC=1 npm run build 2>&1 | tail -20

echo ""
echo "${BLUE}2. Checking Bundle Size...${NC}"
if [ -d ".next" ]; then
  echo "Client bundle:"
  find .next/static/chunks -name "*.js" -exec du -h {} \; | sort -hr | head -10
  
  echo ""
  echo "Total size:"
  du -sh .next/
fi

echo ""
echo "${BLUE}3. Optimizing Images in Public Folder...${NC}"
find public -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) | head -10 | while read img; do
  size=$(du -h "$img" | cut -f1)
  echo "   ${YELLOW}$img${NC} - $size"
done

echo ""
echo "${BLUE}4. Checking Dependencies...${NC}"
npm list --depth=0 2>/dev/null | grep -E "(next|react|@vercel|@next)" | head -10

echo ""
echo "${BLUE}5. Performance Tips:${NC}"
echo "   ${GREEN}✅${NC} Use next/image for automatic optimization"
echo "   ${GREEN}✅${NC} Implement dynamic imports for heavy components"
echo "   ${GREEN}✅${NC} Enable compression in next.config.js"
echo "   ${GREEN}✅${NC} Use loading.tsx and skeleton components"
echo "   ${GREEN}✅${NC} Implement code splitting for routes"
echo ""
echo "   ${YELLOW}⚠️${NC} Check for large node_modules packages"
echo "   ${YELLOW}⚠️${NC} Optimize API response sizes"
echo "   ${YELLOW}⚠️${NC} Implement caching strategies"
echo "   ${YELLOW}⚠️${NC} Monitor Core Web Vitals"

echo ""
echo "${BLUE}6. Quick Wins:${NC}"
echo "   • Lazy load below-the-fold components"
echo "   • Preconnect to external domains"
echo "   • Minimize JavaScript execution time"
echo "   • Optimize fonts and icons"
echo "   • Implement proper caching headers"

echo ""
echo "${GREEN}✅ Performance optimization complete!${NC}"
echo "Run: ${YELLOW}npm run build${NC} to see bundle analysis"
echo "Run: ${YELLOW}ANALYZE=true npm run build${NC} for detailed report"
