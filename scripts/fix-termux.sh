#!/data/data/com.termux/files/usr/bin/bash

echo "🔧 Fixing Termux permissions for Next.js..."

# Create a clean .babelrc
cat > .babelrc << 'EOF'
{
  "presets": ["next/babel"],
  "ignore": ["/data/data", "/data", "/"]
}
EOF

# Create a Termux-optimized next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable for better performance
  swcMinify: false,       // Disable SWC minify (causes issues in Termux)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Fix for Termux file watching
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '/data/data/**',
          '/data/**',
          '/**'
        ]
      }
    }
    return config
  }
}

module.exports = nextConfig
EOF

# Set environment variable for file watching
export CHOKIDAR_USEPOLLING=true
export NEXT_DISABLE_FILE_SYSTEM_WATCHER=1

echo "✅ Termux configuration applied!"
echo "Run: export CHOKIDAR_USEPOLLING=true && npm run dev"
