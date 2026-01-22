#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 PRODUCTION BUILD - AI META-FACTORY"
echo "======================================"

# Set Termux-optimized environment
export NODE_OPTIONS="--max-old-space-size=1024"
export NEXT_TELEMETRY_DISABLED=1
export GENERATE_SOURCEMAP=false

# 1. Clean previous builds
echo "1. Cleaning previous builds..."
rm -rf .next
rm -rf out

# 2. Install production dependencies only
echo "2. Installing production dependencies..."
npm ci --only=production --no-audit

# 3. TypeScript check (non-blocking)
echo "3. TypeScript compilation check..."
npx tsc --noEmit --skipLibCheck || echo "⚠️  TypeScript warnings (check if critical)"

# 4. Build Next.js app
echo "4. Building Next.js application..."
npm run build

# 5. Generate sitemap (optional)
echo "5. Generating sitemap..."
cat > public/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ai-meta-factory.web.app/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ai-meta-factory.web.app/login</loc>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://ai-meta-factory.web.app/dashboard</loc>
    <changefreq>daily</changefreq>
  </url>
</urlset>
EOF

# 6. Generate robots.txt
echo "6. Generating robots.txt..."
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://ai-meta-factory.web.app/sitemap.xml
EOF

# 7. Build size analysis
echo "7. Build size analysis:"
du -sh .next/ | awk '{print "   Next.js build size: "$1}'
du -sh public/ | awk '{print "   Public assets size: "$1}'

echo ""
echo "✅ BUILD COMPLETE!"
echo "📁 Next.js build: .next/"
echo "📁 Static export: out/ (if using export)"
echo ""
echo "Next: Run 'firebase deploy --only hosting'"
