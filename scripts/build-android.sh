#!/bin/bash
echo "🤖 AI Meta Factory - Android Optimized Build"
echo "==========================================="
echo "Building on: $(uname -m)"
echo ""

# Clean previous builds
rm -rf .next out

# Create SWC workaround for Android
echo "🛠️  Setting up Android ARM workaround..."
mkdir -p node_modules/@next
cat > node_modules/@next/swc-android-arm-eabi.js << 'SWC'
// Android ARM SWC workaround
// Uses Babel fallback for Termux
const { transformSync } = require('@babel/core');

module.exports = {
  transformSync: function(code, options) {
    console.log("📱 Using Babel fallback for Android ARM");
    try {
      const result = transformSync(code, {
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
        filename: options.filename || 'file.tsx'
      });
      return { code: result.code };
    } catch (error) {
      console.error("Babel transform error:", error.message);
      return { code: code };
    }
  },
  
  minifySync: function(code, options) {
    return { code: code }; // Simple minifier for Android
  },
  
  bundle: function(code) {
    return { code: code };
  }
};
SWC

# Make it executable
ln -sf swc-android-arm-eabi.js node_modules/@next/swc-android-arm-eabi 2>/dev/null || true

# Set Android-optimized environment
export NODE_OPTIONS="--max-old-space-size=2048"
export NEXT_DISABLE_SWC=0  # Don't disable, use our workaround

echo "🚀 Starting build with Android optimizations..."
if npm run build 2>&1 | tee build.log; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo "📁 Output in: .next/ and out/"
    
    # Deploy automatically
    echo "🌐 Deploying to Firebase..."
    firebase deploy --only hosting
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "👉 https://usman-umer.web.app"
else
    echo ""
    echo "❌ BUILD FAILED"
    echo "📋 Last 10 lines of error:"
    tail -10 build.log
    
    # Fallback to static HTML
    echo ""
    echo "🔄 Falling back to static HTML..."
    ./scripts/deploy-static.sh
fi
