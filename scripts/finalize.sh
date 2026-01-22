#!/data/data/com.termux/files/usr/bin/bash
echo "🧹 Step 1: Cleaning and Finalizing Project..."

# Clean build artifacts and caches
npm run clean
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies for a fresh build
npm ci --only=production

# Run TypeScript compiler to catch any last errors
npx tsc --noEmit

# Run a security audit on dependencies
npm audit --production

echo "✅ Code cleanup and audit complete."
