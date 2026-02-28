#!/bin/bash
# APK Builder for AI Meta Factory
# Usage: ./build-apk.sh /path/to/exported/web/project [app-name]

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-web-project> [app-name]"
  exit 1
fi

WEB_PROJECT="$1"
APP_NAME="${2:-MyApp}"
OUTPUT_DIR="$(pwd)/apk-output"

echo "📦 Building APK for $APP_NAME from $WEB_PROJECT"

# Create working directory
mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

# Initialize Capacitor project
echo "⚡ Initializing Capacitor..."
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android

# Copy web files
echo "📁 Copying web files..."
mkdir -p www
cp -r "$WEB_PROJECT"/* www/ 2>/dev/null || true

# Create capacitor.config.json
cat > capacitor.config.json << CONFIG
{
  "appId": "com.aimetafactory.$APP_NAME",
  "appName": "$APP_NAME",
  "webDir": "www",
  "bundledWebRuntime": false,
  "server": {
    "url": "http://localhost",
    "cleartext": true
  }
}
CONFIG

# Add Android platform
echo "🤖 Adding Android platform..."
npx cap add android

# Sync web code
npx cap sync

# Build debug APK
echo "🔨 Building debug APK..."
cd android
./gradlew assembleDebug

# Copy APK to output
cp app/build/outputs/apk/debug/app-debug.apk "$OUTPUT_DIR/$APP_NAME-debug.apk"

echo "✅ APK built successfully: $OUTPUT_DIR/$APP_NAME-debug.apk"
