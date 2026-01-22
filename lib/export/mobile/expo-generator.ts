import JSZip from 'jszip'
import { Project } from '@/lib/types/builder'
import { ReactNativeTransformer } from './react-native-transformer'

export class ExpoProjectGenerator {
  static async generateProject(project: Project, components: any[]): Promise<Blob> {
    const zip = new JSZip()
    
    // 1. package.json for Expo
    zip.file('package.json', JSON.stringify({
      name: project.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      main: 'node_modules/expo/AppEntry.js',
      scripts: {
        'start': 'expo start',
        'android': 'expo start --android',
        'ios': 'expo start --ios',
        'web': 'expo start --web',
        'build:apk': 'eas build --platform android --profile preview'
      },
      dependencies: {
        'expo': '~50.0.0',
        'expo-status-bar': '~1.11.0',
        'react': '18.2.0',
        'react-native': '0.73.0',
        'react-native-safe-area-context': '4.8.0',
        'react-native-web': '~0.19.0'
      },
      devDependencies: {
        '@babel/core': '^7.20.0'
      },
      private: true
    }, null, 2))

    // 2. App.js main file
    const appCode = this.generateAppCode(project, components)
    zip.file('App.js', appCode)

    // 3. Components directory
    const componentsDir = zip.folder('components')
    components.forEach((comp, index) => {
      const rnComponent = ReactNativeTransformer.convertComponent(comp)
      componentsDir?.file(`Component${index}.js`, rnComponent.code)
    })

    // 4. app.json Expo configuration
    zip.file('app.json', JSON.stringify({
      expo: {
        name: project.name,
        slug: project.name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'light',
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        },
        assetBundlePatterns: ['**/*'],
        ios: {
          supportsTablet: true
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff'
          },
          package: `com.aifactory.${project.name.toLowerCase().replace(/\s+/g, '-')}`
        },
        web: {
          favicon: './assets/favicon.png'
        }
      }
    }, null, 2))

    // 5. Create assets directory with placeholder
    const assetsDir = zip.folder('assets')
    assetsDir?.file('.gitkeep', '')

    // 6. Generate ZIP
    return await zip.generateAsync({ type: 'blob' })
  }

  private static generateAppCode(project: Project, components: any[]): string {
    const imports = components.map((_, i) => `import Component${i} from './components/Component${i}'`).join('\n')
    
    return `
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
${imports}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>${project.name}</Text>
          <Text style={styles.subtitle}>Generated with AI Meta-Software Factory</Text>
        </View>
        
        ${components.map((_, i) => `
        <View style={styles.componentContainer}>
          <Component${i} />
        </View>
        `).join('\n')}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on ${new Date().toLocaleDateString()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  componentContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
  },
})
`
  }
}
