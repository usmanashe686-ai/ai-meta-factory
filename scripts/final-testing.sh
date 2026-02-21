#!/bin/bash
set -e

echo "========================================"
echo "🔍 AI Meta Factory – Final Testing Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ----------------------------------------------------------------------------
# 1. Security Audit
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/5] Running Security Audit...${NC}"

# npm audit (frontend)
echo "→ Running npm audit on frontend..."
npm audit --audit-level=high || echo -e "${YELLOW}⚠️  npm audit found issues – review manually${NC}"

# Check for exposed secrets (using git-secrets or truffleHog – if installed)
if command -v trufflehog &> /dev/null; then
    echo "→ Running trufflehog secrets scan..."
    trufflehog filesystem . --json | jq '.'
else
    echo -e "${YELLOW}⚠️  trufflehog not installed – skipping secrets scan${NC}"
fi

# Check for outdated dependencies
echo "→ Checking outdated dependencies..."
npm outdated || true

# ----------------------------------------------------------------------------
# 2. Performance Testing (k6)
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/5] Running Performance Tests...${NC}"
if command -v k6 &> /dev/null; then
    k6 run load-test/k6-test.js
else
    echo -e "${YELLOW}⚠️  k6 not installed – skipping performance test${NC}"
fi

# ----------------------------------------------------------------------------
# 3. Integration & Unit Tests
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/5] Running Unit & Integration Tests...${NC}"
npm test -- --coverage

# ----------------------------------------------------------------------------
# 4. End‑to‑End Tests (Playwright)
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/5] Running E2E Tests...${NC}"
if [ -d "e2e" ] || [ -f "playwright.config.ts" ]; then
    npx playwright test --project=chromium
else
    echo -e "${YELLOW}⚠️  No Playwright tests found – skipping${NC}"
fi

# ----------------------------------------------------------------------------
# 5. User Acceptance Testing (UAT) Checklist
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/5] User Acceptance Testing Checklist${NC}"
echo "========================================"
echo "Please manually verify the following:"
echo ""
echo "✅ Authentication"
echo "   - [ ] User can sign up / log in"
echo "   - [ ] Protected routes require auth"
echo ""
echo "✅ Canvas"
echo "   - [ ] File explorer loads"
echo "   - [ ] Can create/rename/delete files"
echo "   - [ ] Code editor opens files"
echo "   - [ ] Preview renders correctly"
echo ""
echo "✅ AI Assistant"
echo "   - [ ] AI panel opens"
echo "   - [ ] Sends requests to local AI (port 8000)"
echo "   - [ ] Receives and displays responses"
echo ""
echo "✅ Export"
echo "   - [ ] Export modal opens"
echo "   - [ ] ZIP download works"
echo "   - [ ] Other export options show proper messages"
echo ""
echo "✅ Mobile Responsiveness"
echo "   - [ ] Layout adapts below 768px"
echo "   - [ ] Tab navigation works"
echo ""
echo "========================================"
echo -e "${GREEN}✅ Final testing completed!${NC}"
