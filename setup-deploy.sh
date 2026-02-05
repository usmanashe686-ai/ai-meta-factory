#!/data/data/com.termux/files/usr/bin/bash
# =========================================
# AI Meta Factory: Termux Build & Deploy
# =========================================

# 1️⃣ Navigate to project
cd ~/ai-meta-factory || { echo "Folder not found!"; exit 1; }

echo "✅ In project folder: $(pwd)"

# 2️⃣ Install required packages and fix missing deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# 3️⃣ Install missing packages explicitly
echo "📦 Installing missing packages for build..."
npm install diff prismjs @types/prismjs --save
npm install --save-dev @types/node

# 4️⃣ Optional: Fix audit issues (may upgrade packages)
echo "🛠 Running npm audit fix..."
npm audit fix --force

# 5️⃣ Clean old build cache
echo "🧹 Cleaning old build..."
rm -rf .next node_modules/.cache

# 6️⃣ Run TypeScript check (optional but recommended)
echo "🔍 Running TypeScript check..."
npx tsc --noEmit

# 7️⃣ Build Next.js project
echo "🏗 Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

# 8️⃣ Deploy to Vercel (production)
echo "🚀 Deploying to Vercel..."
npx vercel deploy --prod || { echo "❌ Vercel deploy failed"; exit 1; }

echo "🎉 Deployment complete!"
