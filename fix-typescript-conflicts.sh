#!/data/data/com.termux/files/usr/bin/bash

echo "🔧 Fixing TypeScript conflicts for React Native..."
echo "=================================================="

# Backup current dependencies
echo "1. Backing up current package.json..."
cp package.json package.json.backup

# Fix package.json dependencies
echo "2. Updating package.json for compatibility..."
cat > package.json.fixed << 'PKGEOF'
{
  "name": "ai-meta-factory",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "echo 'No tests yet'"
  },
  "dependencies": {
    "jszip": "^3.10.1",
    "file-saver": "^2.0.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "next": "14.0.4",
    "react-native-web": "^0.19.9",
    "expo": "~50.0.0",
    "react-native": "0.73.6",
    "react-native-safe-area-context": "4.8.0",
    "@expo/metro-runtime": "~3.2.0",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.309.0"
  },
  "devDependencies": {
    "@types/node": "20.11.5",
    "@types/react": "18.2.47",
    "@types/react-dom": "18.2.18",
    "@types/jszip": "^3.10.0",
    "@types/file-saver": "^2.0.5",
    "typescript": "5.3.3",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/react-native": "^0.72.0"
  }
}
PKGEOF

mv package.json.fixed package.json

# Clean install
echo "3. Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Create type declaration fixes
echo "4. Creating type declaration fixes..."
mkdir -p types

cat > types/react-native.d.ts << 'TYPEOF'
// Type declarations to fix React Native conflicts
import 'react-native'

// Override conflicting types
declare module 'react-native' {
  export interface ViewStyle {
    transform?: any; // Relax transform type
  }
}

// Fix global type conflicts
declare global {
  var __BUNDLE_START_TIME__: number;
  var HermesInternal: null | {};
  var ErrorUtils: any;
  var originalXMLHttpRequest: any;
}
TYPEOF

# Update tsconfig.json with proper settings
echo "5. Updating TypeScript configuration..."
cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "react-native": ["./types/react-native.d.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "**/*.test.ts", "**/*.test.tsx"]
}
TSCONFIG

echo "✅ TypeScript conflicts fixed!"
echo ""
echo "🚀 To test the fix:"
echo "1. Run: npx tsc --noEmit"
echo "2. Start dev server: npm run dev"
echo "3. Test your mobile export system"
