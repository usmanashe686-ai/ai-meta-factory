#!/data/data/com.termux/files/usr/bin/bash

echo "🔧 Building with Babel (Termux compatible)..."

# Force Babel usage
export NEXT_DISABLE_SWC=1
export NEXT_IGNORE_ESLINT=1
export NEXT_TELEMETRY_DISABLED=1

# Clear caches
rm -rf .next node_modules/.cache

# Build with explicit flags
npx next build --no-lint

echo "✅ Build attempted with Babel"
echo "Check if .next directory was created:"
ls -la .next 2>/dev/null || echo "No .next directory yet"
