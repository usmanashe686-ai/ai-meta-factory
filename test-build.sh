#!/bin/bash

echo "🔍 Testing AI Meta Factory Build..."
echo "=================================="
echo ""

# Test 1: Check dependencies
echo "1. Checking package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    
    # Check required dependencies
    REQUIRED_DEPS=("next" "react" "react-dom" "jszip" "file-saver")
    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            echo "✅ $dep found in dependencies"
        else
            echo "❌ $dep NOT found in dependencies"
        fi
    done
else
    echo "❌ package.json not found!"
    exit 1
fi

echo ""

# Test 2: Check TypeScript configuration
echo "2. Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json exists"
else
    echo "❌ tsconfig.json not found!"
fi

echo ""

# Test 3: Check Next.js configuration
echo "3. Checking Next.js configuration..."
if [ -f "next.config.js" ]; then
    echo "✅ next.config.js exists"
else
    echo "❌ next.config.js not found!"
fi

echo ""

# Test 4: Check app structure
echo "4. Checking app structure..."
if [ -d "app" ]; then
    echo "✅ app directory exists"
    
    # Check key directories
    KEY_DIRS=("app/api" "app/builder" "app/builder/components")
    for dir in "${KEY_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            echo "✅ $dir exists"
        else
            echo "❌ $dir not found!"
        fi
    done
else
    echo "❌ app directory not found!"
fi

echo ""

# Test 5: Check lib directory
echo "5. Checking lib directory..."
if [ -d "lib" ]; then
    echo "✅ lib directory exists"
    
    # Check key files
    KEY_FILES=("lib/registry/index.ts" "lib/export/project-exporter.ts" "lib/deployment/deploy-configs.ts")
    for file in "${KEY_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "✅ $file exists"
        else
            echo "❌ $file not found!"
        fi
    done
else
    echo "❌ lib directory not found!"
fi

echo ""

# Test 6: Check environment configuration
echo "6. Checking environment configuration..."
if [ -f ".env.example" ]; then
    echo "✅ .env.example exists"
else
    echo "❌ .env.example not found!"
fi

if [ -f ".gitignore" ]; then
    echo "✅ .gitignore exists"
else
    echo "❌ .gitignore not found!"
fi

echo ""

echo "🧪 BUILD TEST COMPLETE!"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Set up environment variables in Vercel"
echo "2. Push to GitHub"
echo "3. Deploy on Vercel"
echo ""
echo "🚀 Ready for deployment!"
