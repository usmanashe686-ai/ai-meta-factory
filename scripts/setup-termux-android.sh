#!/data/data/com.termux/files/usr/bin/bash

echo "🤖 Setting up Android build tools in Termux..."

# Install basic Android tools
pkg install -y aapt apksigner zipalign dx

# Create Android SDK directories
mkdir -p ~/android-sdk/{platforms,build-tools}

# Download command line tools (lightweight)
echo "Downloading Android command line tools..."
wget -q https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip -P ~/
unzip -q ~/commandlinetools-linux-8512546_latest.zip -d ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools/cmdline-tools ~/android-sdk/cmdline-tools/latest

# Set environment variables
echo 'export ANDROID_HOME="$HOME/android-sdk"' >> ~/.bashrc
echo 'export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"' >> ~/.bashrc
echo 'export PATH="$PATH:$ANDROID_HOME/platform-tools"' >> ~/.bashrc

# Install expo-cli
npm install -g expo-cli

echo "✅ Android tools setup complete!"
echo "⚠️  Note: Full Android builds in Termux are limited."
echo "📱 For production APKs, use Expo Application Services (EAS)"
echo ""
echo "To build APK with EAS:"
echo "1. expo login"
echo "2. eas build --platform android"
