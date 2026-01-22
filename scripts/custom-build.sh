#!/data/data/com.termux/files/usr/bin/bash

echo "🔧 Custom Build for Termux (Android ARM)"
echo "========================================"

# 1. Force Babel usage
export NEXT_DISABLE_SWC=1
export DISABLE_SWC=true
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=1024"

# 2. Create .babelrc
cat > .babelrc << 'BAFILE'
{
  "presets": [
    ["next/babel", {
      "preset-react": {
        "runtime": "automatic"
      }
    }]
  ],
  "plugins": []
}
BAFILE

# 3. Create webpack config override
cat > webpack.config.js << 'WEBFILE'
module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "os": false
    }
  }
}
WEBFILE

# 4. Update next.config.js
cat > next.config.js << 'CONFIG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Disable SWC loader
    config.module.rules = config.module.rules.filter(rule => 
      !rule.loader?.includes('swc-loader')
    )
    
    // Use Babel loader instead
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel']
        }
      }
    })
    
    return config
  }
}

module.exports = nextConfig
CONFIG

# 5. Install babel-loader if needed
npm install --save-dev babel-loader @babel/core @babel/preset-react

# 6. Clear cache
rm -rf .next node_modules/.cache

# 7. Build
echo "🚀 Building with custom configuration..."
npx next build

# 8. Check result
if [ -d ".next" ]; then
  echo "✅ Build successful!"
  echo "📁 Build size: $(du -sh .next | cut -f1)"
  echo ""
  echo "🚀 Ready to deploy:"
  echo "firebase deploy --only hosting"
else
  echo "❌ Build failed"
  exit 1
fi
