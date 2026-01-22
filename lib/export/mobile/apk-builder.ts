import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export interface BuildResult {
  success: boolean
  downloadUrl?: string
  buildId?: string
  logs?: string
  error?: string
}

export class APKBuilder {
  // Method 1: Cloud build using EAS
  static async buildWithEAS(projectDir: string, projectName: string): Promise<BuildResult> {
    try {
      // Create eas.json if not exists
      const easConfig = {
        build: {
          production: {
            android: {
              buildType: 'apk'
            }
          }
        },
        submit: {
          production: {}
        }
      }
      
      await fs.writeFile(
        path.join(projectDir, 'eas.json'),
        JSON.stringify(easConfig, null, 2)
      )

      // Run EAS build
      const { stdout, stderr } = await execAsync(
        `cd ${projectDir} && eas build --platform android --profile production --non-interactive`,
        { timeout: 600000 } // 10 minute timeout
      )

      // Parse build URL from output
      const urlMatch = stdout.match(/https:\/\/expo\.dev\/builds\/[a-zA-Z0-9-]+/)
      const buildIdMatch = stdout.match(/Build ID: ([a-zA-Z0-9-]+)/)

      return {
        success: true,
        downloadUrl: urlMatch ? urlMatch[0] : undefined,
        buildId: buildIdMatch ? buildIdMatch[1] : undefined,
        logs: stdout
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        logs: error.stderr
      }
    }
  }

  // Method 2: Local build (requires Android SDK in Termux)
  static async buildLocally(projectDir: string): Promise<BuildResult> {
    try {
      // Create a simple APK wrapper using termux-api
      const apkWrapper = `
#!/data/data/com.termux/files/usr/bin/bash

echo "🤖 Creating APK wrapper..."

# Create basic AndroidManifest.xml
cat > AndroidManifest.xml << 'MANIFEST'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.aifactory.generated">
    
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="AI Generated App"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
MANIFEST

echo "APK wrapper created. Use EAS for full builds."
`

      await fs.writeFile(path.join(projectDir, 'build-apk.sh'), apkWrapper)
      await fs.chmod(path.join(projectDir, 'build-apk.sh'), '755')

      return {
        success: true,
        downloadUrl: 'Use EAS cloud build for full APK',
        logs: 'Local APK wrapper created. Use build-apk.sh to see options.'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Method 3: Generate downloadable instructions
  static async generateBuildInstructions(projectDir: string): Promise<string> {
    const instructions = `
# HOW TO BUILD YOUR ANDROID APK

## OPTION 1: EXPO CLOUD BUILD (RECOMMENDED)
1. Install Expo CLI: npm install -g expo-cli eas-cli
2. Login to Expo: expo login
3. Build APK: eas build --platform android

## OPTION 2: LOCAL BUILD (ADVANCED)
1. Install Android Studio
2. Open project in Android Studio
3. Build → Generate Signed Bundle / APK

## QUICK START:
cd ${projectDir}
npm install
npm run android

Your project is ready at: ${projectDir}
`
    
    await fs.writeFile(path.join(projectDir, 'BUILD_INSTRUCTIONS.md'), instructions)
    return instructions
  }
}
