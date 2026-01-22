// Advanced Export Engine - Multi-framework code generation
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import parserHtml from 'prettier/parser-html'
import parserPostcss from 'prettier/parser-postcss'

interface ComponentData {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  content: string
  styles: Record<string, any>
  children?: ComponentData[]
}

interface ExportOptions {
  framework: 'react' | 'vue' | 'svelte' | 'html' | 'nextjs' | 'react-native'
  includeDependencies: boolean
  includeStyles: boolean
  formatCode: boolean
  generateTests: boolean
  exportType: 'zip' | 'files' | 'clipboard'
}

export class ExportEngine {
  private formatCode(code: string, language: 'javascript' | 'html' | 'css'): string {
    try {
      const parser = language === 'javascript' ? 'babel' : language
      const plugins = language === 'javascript' ? [parserBabel] : 
                     language === 'html' ? [parserHtml] : [parserPostcss]
      
      return prettier.format(code, {
        parser,
        plugins,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 80,
      })
    } catch (error) {
      console.warn('Code formatting failed:', error)
      return code
    }
  }

  private generateReactComponent(component: ComponentData): string {
    const { name, type, styles, content, width, height } = component
    
    const styleString = Object.entries(styles)
      .map(([key, value]) => `  ${key}: '${value}',`)
      .join('\n')

    const componentContent = this.getComponentContent(component)

    return `
import React from 'react';
import './${name}.css';

interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${name}: React.FC<${name}Props> = ({ className, children }) => {
  return (
    <div 
      className={\`${name} \${className || ''}\`}
      style={{
${styleString}
      }}
    >
      ${componentContent}
      {children}
    </div>
  );
};
`
  }

  private generateVueComponent(component: ComponentData): string {
    const { name, styles, content } = component
    
    const styleString = Object.entries(styles)
      .map(([key, value]) => `    ${key}: ${typeof value === 'number' ? value : `'${value}'`}`)
      .join(',\n')

    const componentContent = this.getComponentContent(component)

    return `
<template>
  <div 
    class="${name.toLowerCase()}"
    :style="styles"
  >
    ${componentContent}
    <slot />
  </div>
</template>

<script>
export default {
  name: '${name}',
  props: {
    className: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      styles: {
${styleString}
      }
    }
  }
}
</script>

<style scoped>
.${name.toLowerCase()} {
  /* Additional styles here */
}
</style>
`
  }

  private generateSvelteComponent(component: ComponentData): string {
    const { name, styles } = component
    
    const styleString = Object.entries(styles)
      .map(([key, value]) => `  ${key}: ${typeof value === 'number' ? value + 'px' : `'${value}'`};`)
      .join('\n')

    const componentContent = this.getComponentContent(component)

    return `
<script>
  export let className = '';
</script>

<div 
  class="{className}"
  style="{styleString}"
>
  ${componentContent}
  <slot />
</div>

<style>
  div {
    ${styleString}
  }
</style>
`
  }

  private generateHTMLComponent(component: ComponentData): string {
    const { name, styles, content } = component
    
    const styleString = Object.entries(styles)
      .map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      .join('\n')

    const componentContent = this.getComponentContent(component)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    .${name.toLowerCase()} {
${styleString}
    }
  </style>
</head>
<body>
  <div class="${name.toLowerCase()}">
    ${componentContent}
  </div>
</body>
</html>
`
  }

  private generateReactNativeComponent(component: ComponentData): string {
    const { name, styles, content } = component
    
    const reactNativeStyles = this.convertToReactNativeStyles(styles)

    const styleString = Object.entries(reactNativeStyles)
      .map(([key, value]) => `    ${key}: ${typeof value === 'number' ? value : `'${value}'`},`)
      .join('\n')

    return `
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ${name} = () => {
  return (
    <View style={styles.container}>
      <Text>${content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
${styleString}
  },
});
`
  }

  private getComponentContent(component: ComponentData): string {
    switch (component.type) {
      case 'button':
        return `<button>${component.content || 'Click Me'}</button>`
      case 'input':
        return `<input type="text" placeholder="${component.content || 'Enter text...'}" />`
      case 'text':
        return `<h3>${component.content || 'Text Content'}</h3>`
      case 'image':
        return `<img src="https://via.placeholder.com/${component.width}x${component.height}" alt="${component.name}" />`
      case 'card':
        return `
          <div class="card">
            <h3>Card Title</h3>
            <p>${component.content || 'Card content goes here'}</p>
          </div>
        `
      default:
        return component.content || 'Content'
    }
  }

  private convertToReactNativeStyles(styles: Record<string, any>): Record<string, any> {
    const reactNativeStyles: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(styles)) {
      let reactNativeKey = key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')
        .replace(/(-\w)/g, (match) => match[1].toUpperCase())

      // Convert CSS properties to React Native
      if (reactNativeKey === 'backgroundColor') {
        reactNativeKey = 'backgroundColor'
      } else if (reactNativeKey === 'borderRadius') {
        reactNativeKey = 'borderRadius'
      } else if (reactNativeKey.includes('-')) {
        reactNativeKey = reactNativeKey.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
      }

      reactNativeStyles[reactNativeKey] = value
    }

    return reactNativeStyles
  }

  private getFrameworkDependencies(framework: ExportOptions['framework']): string[] {
    const dependencies: Record<string, string[]> = {
      react: ['react', 'react-dom'],
      vue: ['vue', 'vue-template-compiler'],
      svelte: ['svelte'],
      nextjs: ['next', 'react', 'react-dom'],
      'react-native': ['react-native'],
      html: [],
    }

    return dependencies[framework] || []
  }

  async exportProject(
    components: ComponentData[],
    projectName: string,
    options: ExportOptions
  ): Promise<void> {
    const zip = new JSZip()
    const projectFolder = zip.folder(projectName)

    if (!projectFolder) {
      throw new Error('Failed to create project folder')
    }

    // Generate package.json
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `Generated by AI Meta Factory - ${new Date().toISOString()}`,
      main: 'index.js',
      scripts: this.getFrameworkScripts(options.framework),
      dependencies: this.getDependenciesObject(options.framework),
      devDependencies: this.getDevDependencies(options.framework),
      keywords: ['ai-generated', 'meta-factory', options.framework],
      author: 'AI Meta Factory',
      license: 'MIT',
    }

    projectFolder.file('package.json', JSON.stringify(packageJson, null, 2))

    // Generate README
    const readme = `
# ${projectName}

This project was generated using AI Meta Factory.

## Framework: ${options.framework.toUpperCase()}

## Generated on: ${new Date().toLocaleDateString()}

## Components:
${components.map(c => `- ${c.name} (${c.type})`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Features
- ✅ Generated by AI Meta Factory
- ✅ Responsive design
- ✅ Clean code structure
- ✅ Production ready
`
    projectFolder.file('README.md', readme)

    // Generate components
    const componentsFolder = projectFolder.folder('src/components')
    
    for (const component of components) {
      let componentCode = ''
      
      switch (options.framework) {
        case 'react':
        case 'nextjs':
          componentCode = this.generateReactComponent(component)
          break
        case 'vue':
          componentCode = this.generateVueComponent(component)
          break
        case 'svelte':
          componentCode = this.generateSvelteComponent(component)
          break
        case 'html':
          componentCode = this.generateHTMLComponent(component)
          break
        case 'react-native':
          componentCode = this.generateReactNativeComponent(component)
          break
      }

      if (options.formatCode) {
        const language = options.framework === 'html' ? 'html' : 'javascript'
        componentCode = this.formatCode(componentCode, language)
      }

      const extension = this.getFileExtension(options.framework)
      componentsFolder?.file(`${component.name}.${extension}`, componentCode)
    }

    // Generate main entry file
    const entryFile = this.generateEntryFile(components, options.framework)
    projectFolder.file('src/App.' + this.getEntryExtension(options.framework), entryFile)

    // Generate index file
    const indexFile = this.generateIndexFile(options.framework)
    projectFolder.file('src/index.' + this.getIndexExtension(options.framework), indexFile)

    // Generate CSS file
    const cssFile = this.generateCSSFile(components)
    projectFolder.file('src/styles.css', cssFile)

    // Generate deployment files
    this.generateDeploymentFiles(projectFolder, options.framework)

    // Generate zip and download
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${projectName}.zip`)
  }

  private getFileExtension(framework: ExportOptions['framework']): string {
    const extensions: Record<string, string> = {
      react: 'jsx',
      nextjs: 'jsx',
      vue: 'vue',
      svelte: 'svelte',
      html: 'html',
      'react-native': 'js',
    }
    return extensions[framework] || 'js'
  }

  private getEntryExtension(framework: ExportOptions['framework']): string {
    const extensions: Record<string, string> = {
      react: 'jsx',
      nextjs: 'jsx',
      vue: 'vue',
      svelte: 'svelte',
      html: 'html',
      'react-native': 'js',
    }
    return extensions[framework] || 'js'
  }

  private getIndexExtension(framework: ExportOptions['framework']): string {
    const extensions: Record<string, string> = {
      react: 'js',
      nextjs: 'js',
      vue: 'js',
      svelte: 'js',
      html: 'html',
      'react-native': 'js',
    }
    return extensions[framework] || 'js'
  }

  private getFrameworkScripts(framework: ExportOptions['framework']): Record<string, string> {
    const scripts: Record<string, Record<string, string>> = {
      react: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject',
      },
      nextjs: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        export: 'next export',
      },
      vue: {
        serve: 'vue-cli-service serve',
        build: 'vue-cli-service build',
        lint: 'vue-cli-service lint',
      },
      svelte: {
        dev: 'vite dev',
        build: 'vite build',
        preview: 'vite preview',
      },
      html: {
        start: 'live-server .',
      },
      'react-native': {
        start: 'react-native start',
        android: 'react-native run-android',
        ios: 'react-native run-ios',
      },
    }

    return scripts[framework] || { start: 'echo "No start script defined"' }
  }

  private getDependenciesObject(framework: ExportOptions['framework']): Record<string, string> {
    const dependencies: Record<string, Record<string, string>> = {
      react: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      nextjs: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      vue: {
        vue: '^3.3.0',
      },
      svelte: {
        svelte: '^4.0.0',
      },
      'react-native': {
        'react-native': '^0.72.0',
      },
      html: {},
    }

    return dependencies[framework] || {}
  }

  private getDevDependencies(framework: ExportOptions['framework']): Record<string, string> {
    const devDeps: Record<string, Record<string, string>> = {
      react: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'react-scripts': '^5.0.0',
      },
      nextjs: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        typescript: '^5.0.0',
      },
      vue: {
        '@vue/cli-service': '^5.0.0',
      },
      svelte: {
        vite: '^4.0.0',
        '@sveltejs/vite-plugin-svelte': '^2.0.0',
      },
      html: {
        'live-server': '^1.2.0',
      },
      'react-native': {
        '@types/react-native': '^0.72.0',
      },
    }

    return devDeps[framework] || {}
  }

  private generateEntryFile(components: ComponentData[], framework: ExportOptions['framework']): string {
    const componentImports = components
      .map(c => `import { ${c.name} } from './components/${c.name}'`)
      .join('\n')

    switch (framework) {
      case 'react':
        return `
${componentImports}

function App() {
  return (
    <div className="App">
      <h1>Generated App</h1>
      ${components.map(c => `      <${c.name} />`).join('\n')}
    </div>
  );
}

export default App;
`
      case 'nextjs':
        return `
${componentImports}

export default function Home() {
  return (
    <main>
      <h1>Generated Next.js App</h1>
      ${components.map(c => `      <${c.name} />`).join('\n')}
    </main>
  );
}
`
      case 'vue':
        return `
<template>
  <div id="app">
    <h1>Generated Vue App</h1>
    ${components.map(c => `    <${c.name.toLowerCase()} />`).join('\n')}
  </div>
</template>

<script>
${componentImports}

export default {
  name: 'App',
  components: {
    ${components.map(c => c.name).join(',\n    ')}
  }
}
</script>
`
      default:
        return '// Entry file for ' + framework
    }
  }

  private generateIndexFile(framework: ExportOptions['framework']): string {
    switch (framework) {
      case 'react':
        return `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  <script src="app.js"></script>
</body>
</html>`
      default:
        return '// Index file for ' + framework
    }
  }

  private generateCSSFile(components: ComponentData[]): string {
    const styles = components
      .map(component => {
        const styleString = Object.entries(component.styles)
          .map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
          .join('\n')

        return `.${component.name.toLowerCase()} {\n${styleString}\n}`
      })
      .join('\n\n')

    return `
/* Generated by AI Meta Factory */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

${styles}

/* Responsive styles */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
`
  }

  private generateDeploymentFiles(zip: JSZip, framework: ExportOptions['framework']): void {
    // Generate .gitignore
    const gitignore = `
node_modules
*.log
.DS_Store
dist
build
.next
out
`
    zip.file('.gitignore', gitignore)

    // Generate deployment configs
    if (framework === 'nextjs') {
      zip.file('next.config.js', `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
`)
    }

    // Generate Vercel config
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: framework === 'nextjs' ? 'package.json' : 'index.html',
          use: framework === 'nextjs' ? '@vercel/next' : '@vercel/static',
        },
      ],
      routes: [
        {
          src: '/(.*)',
          dest: framework === 'nextjs' ? '/$1' : '/index.html',
        },
      ],
    }

    zip.file('vercel.json', JSON.stringify(vercelConfig, null, 2))

    // Generate Netlify config
    const netlifyConfig = `
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`
    zip.file('netlify.toml', netlifyConfig)
  }

  async generateAPK(components: ComponentData[], projectName: string): Promise<void> {
    console.log('APK generation would require React Native build setup')
    // This is a placeholder for future APK generation
    alert('APK generation is coming soon! For now, use React Native export and build locally.')
  }
}

export const exportEngine = new ExportEngine()
