#!/data/data/com.termux/files/usr/bin/bash

echo "🔍 CHECKING GITHUB ACTIONS STATUS"
echo "================================"

REPO="usmanashe686-ai/ai-meta-factory"

echo "1. Latest workflow runs:"
curl -s "https://api.github.com/repos/$REPO/actions/runs" | grep -E "(status|conclusion|head_branch)" | head -15

echo ""
echo "2. Open GitHub Actions in browser..."
termux-open-url "https://github.com/$REPO/actions"

echo ""
echo "3. Check deployments..."
termux-open-url "https://github.com/$REPO/deployments"
