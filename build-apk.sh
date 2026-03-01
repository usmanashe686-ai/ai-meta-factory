#!/bin/bash

# AI Meta Factory APK Build Script for Termux

# 1️⃣ Grant storage access (if not done already)
termux-setup-storage

# 2️⃣ Set project directory
PROJECT_DIR=~/ai-meta-factory
cd $PROJECT_DIR || { echo "Project folder not found!"; exit 1; }

# 3️⃣ Check Downloads folder for next-out.zip
ARTIFACT=~/storage/downloads/next-out.zip
if [ ! -f "$ARTIFACT" ]; then
  echo "Artifact not found at $ARTIFACT"
  exit 1
fi

# 4️⃣ Unzip artifact to project root
echo "Extracting next-out.zip..."
unzip -o "$ARTIFACT" -d "$PROJECT_DIR"

# 5️⃣ Update capacitor.config.ts to point to 'out'
echo "Updating capacitor.config.ts..."
cat > capacitor.config.ts << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aimetafactory.app',
  appName: 'AI Meta Factory',
  webDir: 'out',
  server: {
    url: 'http://localhost',
    cleartext: true
  }
};

export default config;
EOF

# 6️⃣ Add Android platform if not already added
if [ ! -d "android" ]; then
  echo "Adding Android platform..."
  npx cap add android
else
  echo "Android platform already exists, skipping add."
fi

# 7️⃣ Sync Capacitor
echo "Syncing Capacitor..."
npx cap sync android

# 8️⃣ Open Android Studio
echo "Opening Android Studio..."
npx cap open android

echo "✅ All done! Now you can build the APK inside Android Studio."
