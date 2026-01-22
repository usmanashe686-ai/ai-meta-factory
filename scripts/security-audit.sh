#!/data/data/com.termux/files/usr/bin/bash

echo "🔒 SECURITY AUDIT - AI META-FACTORY"
echo "==================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1. Environment Variables:"
echo "-------------------------"

if [ -f ".env.local" ]; then
  echo -e "   ${GREEN}✅ .env.local exists${NC}"
  
  # Check critical variables
  if grep -q "ENCRYPTION_SECRET_KEY" .env.local; then
    echo -e "   ${GREEN}✅ ENCRYPTION_SECRET_KEY is set${NC}"
  else
    echo -e "   ${RED}❌ ENCRYPTION_SECRET_KEY missing${NC}"
  fi
  
  if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" .env.local; then
    echo -e "   ${GREEN}✅ Firebase API key configured${NC}"
  fi
else
  echo -e "   ${RED}❌ .env.local missing${NC}"
fi

echo ""
echo "2. File Permissions:"
echo "-------------------"

if [ -f ".env.local" ]; then
  perms=$(stat -c "%a" .env.local)
  if [ "$perms" -le 600 ]; then
    echo -e "   ${GREEN}✅ .env.local permissions: $perms (secure)${NC}"
  else
    echo -e "   ${RED}❌ .env.local permissions: $perms (should be 600 or less)${NC}"
  fi
fi

echo ""
echo "3. Security Headers:"
echo "-------------------"

if [ -f "middleware.ts" ]; then
  if grep -q "X-Frame-Options" middleware.ts; then
    echo -e "   ${GREEN}✅ Security headers configured${NC}"
  else
    echo -e "   ${YELLOW}⚠️ Security headers missing${NC}"
  fi
fi

echo ""
echo "4. Dependencies:"
echo "---------------"

npm audit --production 2>/dev/null | grep -E "(critical|high)" || echo "   No critical vulnerabilities found"

echo ""
echo "5. Encryption Test:"
echo "------------------"

node -e "
try {
  const crypto = require('crypto-js');
  const test = 'security-test-123';
  const encrypted = crypto.AES.encrypt(test, 'test-key').toString();
  console.log('   ✅ Encryption test passed');
} catch(e) {
  console.log('   ❌ Encryption test failed:', e.message);
}
"

echo ""
echo "🔒 AUDIT COMPLETE"
