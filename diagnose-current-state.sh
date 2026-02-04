#!/bin/bash

echo "=== CURRENT STATE DIAGNOSTIC ==="
echo ""
echo "1. Monaco Dependencies:"
npm list @monaco-editor/react 2>/dev/null | head -5 || echo "  Not installed"
echo ""

echo "2. Builder Page Structure:"
grep -n "activeTab.*canvas\|Canvas" app/builder/page.tsx | head -10
echo ""

echo "3. Existing Editor Components:"
ls -la app/builder/components/*editor* 2>/dev/null || echo "  No editor-specific components"
echo ""

echo "4. Current Package.json Dependencies:"
grep -A5 -B5 "monaco\|editor" package.json || echo "  No Monaco in package.json"
echo ""

echo "5. File Tree in Screenshot:"
echo "  From screenshot: components/Button.tsx, components/Card.tsx, lib/utils.ts"
echo ""
