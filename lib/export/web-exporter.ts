import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface ProjectExport {
  name: string;
  description: string;
  components: Array<{
    id: string;
    type: string;
    props: Record<string, any>;
    code?: string;
  }>;
  pages: Array<{
    path: string;
    components: string[];
  }>;
  settings: {
    framework: 'nextjs' | 'react' | 'vue';
    styling: 'tailwind' | 'css' | 'styled-components';
  };
}

export class WebExporter {
  async exportProject(project: ProjectExport): Promise<Blob> {
    const zip = new JSZip();
    
    // 1. Create package.json
    zip.file('package.json', this.generatePackageJson(project));
    
    // 2. Create README
    zip.file('README.md', this.generateReadme(project));
    
    // 3. Create Next.js configuration
    zip.file('next.config.js', this.generateNextConfig());
    
    // 4. Create Tailwind config
    zip.file('tailwind.config.js', this.generateTailwindConfig());
    
    // 5. Create global styles
    zip.file('styles/globals.css', this.generateGlobalStyles());
    
    // 6. Create components
    const componentsDir = zip.folder('components');
    project.components.forEach((component, index) => {
      componentsDir?.file(
        `Component${index + 1}.tsx`,
        this.generateComponentCode(component)
      );
    });
    
    // 7. Create pages
    const pagesDir = zip.folder('pages');
    project.pages.forEach(page => {
      pagesDir?.file(
        `${page.path === '/' ? 'index' : page.path}.tsx`,
        this.generatePageCode(page, project.components)
      );
    });
    
    // 8. Create API routes (if any)
    const apiDir = zip.folder('pages/api');
    apiDir?.file('hello.ts', this.generateApiRoute());
    
    // 9. Generate the ZIP file
    return await zip.generateAsync({ type: 'blob' });
  }
  
  private generatePackageJson(project: ProjectExport): string {
    return JSON.stringify({
      name: project.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'tailwindcss': '^3.3.0',
        'autoprefixer': '^10.4.0',
        'postcss': '^8.4.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'typescript': '^5.0.0',
        'eslint': '^8.0.0',
        'eslint-config-next': '^14.0.0'
      }
    }, null, 2);
  }
  
  private generateReadme(project: ProjectExport): string {
    return `# ${project.name}

${project.description}

## Generated with AI Meta-Software Factory

### Project Details
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Components**: ${project.components.length}
- **Pages**: ${project.pages.length}

### Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000)

### Project Structure
- \`/pages\` - Next.js pages
- \`/components\` - React components
- \`/styles\` - Global styles
- \`/public\` - Static assets

### Generated Components
${project.components.map((c, i) => `- Component${i + 1}: ${c.type}`).join('\n')}

---
*This project was AI-generated at ${new Date().toISOString()}*
`;
  }
  
  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
`;
  }
  
  private generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
  }
  
  private generateGlobalStyles(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`;
  }
  
  private generateComponentCode(component: any): string {
    const componentName = `Component${component.id || Date.now()}`;
    
    return `import React from 'react';

interface ${componentName}Props {
  ${Object.keys(component.props || {}).map(key => {
    const value = component.props[key];
    const type = typeof value === 'string' ? 'string' :
                typeof value === 'number' ? 'number' :
                typeof value === 'boolean' ? 'boolean' : 'any';
    return `${key}${type === 'any' ? '?' : ''}: ${type}`;
  }).join('\n  ')}
}

const ${componentName}: React.FC<${componentName}Props> = ({
  ${Object.keys(component.props || {}).join(',\n  ')}
}) => {
  return (
    <div className="${component.type}-component p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">${componentName}</h3>
      ${component.code || `<p>${JSON.stringify(component.props, null, 2)}</p>`}
    </div>
  );
};

export default ${componentName};
`;
  }
  
  private generatePageCode(page: any, components: any[]): string {
    const imports = components
      .map((_, i) => `import Component${i + 1} from '../components/Component${i + 1}';`)
      .join('\n');
    
    return `${imports}

export default function ${page.path === '/' ? 'Home' : page.path.charAt(0).toUpperCase() + page.path.slice(1)}Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            ${page.path === '/' ? 'Home' : page.path} Page
          </h1>
          <p className="text-gray-600">AI-generated page</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${components.map((_, i) => `<Component${i + 1} key={${i}} />`).join('\n          ')}
        </div>
      </main>
      
      <footer className="mt-8 py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Generated with ❤️ by AI Meta-Software Factory</p>
        </div>
      </footer>
    </div>
  );
}
`;
  }
  
  private generateApiRoute(): string {
    return `import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
  timestamp: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    message: 'Hello from your AI-generated API!',
    timestamp: new Date().toISOString()
  });
}
`;
  }
}
