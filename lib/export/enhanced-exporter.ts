import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface ProjectFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

export interface ExportConfig {
  projectName: string;
  description?: string;
  author?: string;
  version?: string;
  stack: string;
  database: string;
  gitProvider: string;
  files: Record<string, string>;
  dependencies?: Record<string, string>;
  environmentVariables?: Record<string, string>;
}

export class EnhancedProjectExporter {
  private zip: JSZip;
  private config: ExportConfig;

  constructor(config: ExportConfig) {
    this.zip = new JSZip();
    this.config = config;
  }

  async exportAsZip(): Promise<void> {
    try {
      console.log(`📦 Exporting project: ${this.config.projectName}`);
      
      // Create main project folder
      const projectFolder = this.zip.folder(this.config.projectName);
      if (!projectFolder) throw new Error('Failed to create project folder');

      // Add package.json based on stack
      projectFolder.file('package.json', this.generatePackageJson());
      
      // Add README.md
      projectFolder.file('README.md', this.generateReadme());
      
      // Add .gitignore
      projectFolder.file('.gitignore', this.generateGitignore());
      
      // Add .env.example
      projectFolder.file('.env.example', this.generateEnvExample());
      
      // Add tsconfig.json for TypeScript projects
      if (['nextjs', 'react', 'node'].includes(this.config.stack)) {
        projectFolder.file('tsconfig.json', this.generateTsConfig());
      }
      
      // Add tailwind.config.js if using tailwind
      if (['nextjs', 'react'].includes(this.config.stack)) {
        projectFolder.file('tailwind.config.js', this.generateTailwindConfig());
      }
      
      // Add next.config.js for Next.js
      if (this.config.stack === 'nextjs') {
        projectFolder.file('next.config.js', this.generateNextConfig());
      }
      
      // Add all generated files with proper structure
      this.addGeneratedFiles(projectFolder);
      
      // Generate ZIP
      const content = await this.zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      // Download
      saveAs(content, `${this.config.projectName}.zip`);
      
      console.log('✅ Project exported successfully!');
      return;
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  }

  private generatePackageJson(): string {
    const basePackage = {
      name: this.config.projectName.toLowerCase().replace(/\s+/g, '-'),
      version: this.config.version || '1.0.0',
      description: this.config.description || 'AI-generated project from AI Meta Factory',
      author: this.config.author || 'AI Meta Factory',
      private: true,
      scripts: this.getStackScripts(),
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
    };

    return JSON.stringify(basePackage, null, 2);
  }

  private getStackScripts(): Record<string, string> {
    const scripts: Record<string, Record<string, string>> = {
      nextjs: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      react: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
      },
      node: {
        "dev": "nodemon src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js",
        "lint": "eslint . --ext ts"
      },
      flutter: {
        "analyze": "flutter analyze",
        "build": "flutter build apk",
        "test": "flutter test"
      },
      python: {
        "dev": "uvicorn main:app --reload",
        "start": "uvicorn main:app --host 0.0.0.0 --port 8000"
      }
    };

    return scripts[this.config.stack] || { "start": "echo 'No scripts configured'" };
  }

  private getDependencies(): Record<string, string> {
    const deps: Record<string, Record<string, string>> = {
      nextjs: {
        "next": "^14.0.0",
        "react": "^18",
        "react-dom": "^18",
        "tailwindcss": "^3.3.0"
      },
      react: {
        "react": "^18",
        "react-dom": "^18",
        "vite": "^5.0.0"
      },
      node: {
        "express": "^4.18.0",
        "cors": "^2.8.5",
        "dotenv": "^16.0.0"
      },
      python: {
        "fastapi": "^0.104.0",
        "uvicorn": "^0.24.0"
      }
    };

    // Add database dependencies
    if (this.config.database !== 'none') {
      const dbDeps = this.getDatabaseDependencies();
      return { ...deps[this.config.stack], ...dbDeps };
    }

    return deps[this.config.stack] || {};
  }

  private getDatabaseDependencies(): Record<string, string> {
    const dbDeps: Record<string, Record<string, string>> = {
      supabase: {
        "@supabase/supabase-js": "^2.0.0"
      },
      firebase: {
        "firebase": "^10.0.0"
      },
      mongodb: {
        "mongodb": "^5.0.0"
      },
      planetscale: {
        "@planetscale/database": "^1.0.0"
      }
    };

    return dbDeps[this.config.database] || {};
  }

  private getDevDependencies(): Record<string, string> {
    const devDeps: Record<string, Record<string, string>> = {
      nextjs: {
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "typescript": "^5",
        "autoprefixer": "^10.0.0",
        "postcss": "^8.0.0"
      },
      react: {
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "typescript": "^5",
        "tailwindcss": "^3.3.0",
        "autoprefixer": "^10.0.0",
        "postcss": "^8.0.0"
      },
      node: {
        "@types/node": "^20",
        "@types/express": "^4.17.0",
        "typescript": "^5",
        "nodemon": "^3.0.0",
        "ts-node": "^10.9.0"
      }
    };

    return devDeps[this.config.stack] || {};
  }

  private generateReadme(): string {
    return `# ${this.config.projectName}

![AI Meta Factory](https://img.shields.io/badge/Generated%20by-AI%20Meta%20Factory-blue)
![Stack](https://img.shields.io/badge/Stack-${this.config.stack}-green)
![Database](https://img.shields.io/badge/Database-${this.config.database}-orange)

## 🚀 Project Overview

This project was automatically generated by **AI Meta Factory** with the following configuration:

| Feature | Technology |
|---------|------------|
| **Stack** | ${this.config.stack.toUpperCase()} |
| **Database** | ${this.config.database.toUpperCase()} |
| **Git Provider** | ${this.config.gitProvider.toUpperCase()} |
| **Generated** | ${new Date().toISOString().split('T')[0]} |

## 📦 Installation

\`\`\`bash
# Clone repository
git clone <repository-url>
cd ${this.config.projectName}

# Install dependencies
${this.getInstallCommand()}

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
${this.getStartCommand()}
\`\`\`

## 🗄️ Database Setup

${this.getDatabaseSetupGuide()}

## 🌐 Deployment

${this.getDeploymentGuide()}

## 📁 Project Structure

\`\`\`
${this.config.projectName}/
├── src/              # Source code
├── public/           # Static assets
├── package.json      # Dependencies
├── README.md         # This file
├── .env.example      # Environment variables template
└── ...              # Configuration files
\`\`\`

## 🤖 Generated by AI Meta Factory

This project was automatically generated by AI. Feel free to customize and extend it according to your needs.

> **Note**: Review all generated code before deploying to production.

## 🔗 Links

- [AI Meta Factory](https://ai-meta-factory.com)
- [Documentation](${this.getDocumentationLink()})
- [Report Issues](https://github.com/ai-meta-factory/issues)
`;
  }

  private getInstallCommand(): string {
    if (this.config.stack === 'python') return 'pip install -r requirements.txt';
    if (this.config.stack === 'flutter') return 'flutter pub get';
    return 'npm install';
  }

  private getStartCommand(): string {
    const commands: Record<string, string> = {
      nextjs: 'npm run dev',
      react: 'npm run dev',
      node: 'npm run dev',
      python: 'python main.py',
      flutter: 'flutter run'
    };
    return commands[this.config.stack] || 'npm start';
  }

  private getDatabaseSetupGuide(): string {
    const guides: Record<string, string> = {
      supabase: `### 🟢 Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for database to be provisioned

2. **Get API Keys**
   - Go to Project Settings > API
   - Copy:
     - \`SUPABASE_URL\`
     - \`SUPABASE_ANON_KEY\`
     - \`SUPABASE_SERVICE_ROLE_KEY\` (for server-side)

3. **Set Environment Variables**
   \`\`\`bash
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   \`\`\`

4. **Run SQL Migrations**
   - Use the SQL editor in Supabase dashboard
   - Or use the Supabase CLI`,
      
      firebase: `### 🔥 Firebase Setup

1. **Create Firebase Project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Create a new project
   - Enable Firestore Database

2. **Add Web App**
   - Click "Add app" > Web
   - Register your app
   - Copy Firebase configuration

3. **Set Environment Variables**
   \`\`\`bash
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   \`\`\``,
      
      mongodb: `### 🍃 MongoDB Atlas Setup

1. **Create MongoDB Atlas Cluster**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com)
   - Create a free cluster
   - Set up database access and network access

2. **Get Connection String**
   - Go to Database > Connect
   - Choose "Connect your application"
   - Copy the connection string

3. **Set Environment Variables**
   \`\`\`bash
   MONGODB_URI=your-connection-string
   MONGODB_DB_NAME=your-database-name
   \`\`\``,
      
      planetscale: `### 🟣 PlanetScale Setup

1. **Create PlanetScale Database**
   - Go to [planetscale.com](https://planetscale.com)
   - Create a new database
   - Get connection credentials

2. **Set Environment Variables**
   \`\`\`bash
   DATABASE_URL=mysql://username:password@host/database
   \`\`\`

3. **Run Migrations**
   - Use PlanetScale CLI or dashboard
   - Create tables as needed`,
      
      none: `### ⚪ No Database

This project doesn't require a database setup. Data is stored locally or uses mock data.`
    };

    return guides[this.config.database] || guides.none;
  }

  private getDeploymentGuide(): string {
    const guides: Record<string, string> = {
      nextjs: `### ▲ Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourname/${this.config.projectName}.git
   git push -u origin main
   \`\`\`

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Click "Deploy"

3. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Set up SSL automatically

### ● Netlify (Alternative)

1. **Push to GitHub** (same as above)
2. **Import in Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Add build settings:
     - Build command: \`npm run build\`
     - Publish directory: \`.next\`
3. **Add environment variables**`,
      
      react: `### ▲ Vercel Deployment

1. **Push to GitHub**
2. **Import in Vercel**
   - Build command: \`npm run build\`
   - Output directory: \`dist\`
   - Add environment variables

### ● Netlify Deployment

1. **Push to GitHub**
2. **Import in Netlify**
   - Build command: \`npm run build\`
   - Publish directory: \`dist\`
   - Add environment variables`,
      
      flutter: `### Firebase Hosting

1. **Build Web Version**
   \`\`\`bash
   flutter build web
   \`\`\`

2. **Deploy to Firebase**
   \`\`\`bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize project
   firebase init hosting

   # Deploy
   firebase deploy --only hosting
   \`\`\``,
      
      node: `### Railway / Render

1. **Push to GitHub**
2. **Create new service on Railway/Render**
3. **Add environment variables**
4. **Configure start command: \`npm start\`**
5. **Deploy**`,
      
      python: `### Railway / Render

1. **Push to GitHub**
2. **Create new service on Railway/Render**
3. **Add environment variables**
4. **Configure start command: \`python main.py\`**
5. **Deploy**`
    };

    return guides[this.config.stack] || 'Deployment instructions not available for this stack.';
  }

  private getDocumentationLink(): string {
    const links: Record<string, string> = {
      nextjs: 'https://nextjs.org/docs',
      react: 'https://react.dev',
      flutter: 'https://flutter.dev',
      node: 'https://nodejs.org/docs',
      python: 'https://python.org'
    };
    return links[this.config.stack] || 'https://ai-meta-factory.com/docs';
  }

  private generateGitignore(): string {
    const base = `# Dependencies
node_modules/
.next/
dist/
build/
.coverage/

# Environment
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
`;

    const additions: Record<string, string> = {
      nextjs: '\n# Next.js\n.next/\n',
      react: '\n# Vite\n.cache/\n',
      flutter: '\n# Flutter\n.dart_tool/\n.packages\n.pub-cache/\nbuild/\n',
      node: '\n# Node\ncoverage/\n',
      python: '\n# Python\n__pycache__/\n*.pyc\nvenv/\n.env/\n'
    };

    return base + (additions[this.config.stack] || '');
  }

  private generateEnvExample(): string {
    const baseVars: Record<string, string[]> = {
      supabase: [
        'SUPABASE_URL=',
        'SUPABASE_ANON_KEY=',
        'SUPABASE_SERVICE_ROLE_KEY='
      ],
      firebase: [
        'FIREBASE_API_KEY=',
        'FIREBASE_AUTH_DOMAIN=',
        'FIREBASE_PROJECT_ID=',
        'FIREBASE_STORAGE_BUCKET=',
        'FIREBASE_MESSAGING_SENDER_ID=',
        'FIREBASE_APP_ID='
      ],
      mongodb: [
        'MONGODB_URI=',
        'MONGODB_DB_NAME='
      ],
      planetscale: [
        'DATABASE_URL='
      ]
    };

    const dbVars = baseVars[this.config.database] || [];
    
    const stackVars: Record<string, string[]> = {
      nextjs: [
        'NEXT_PUBLIC_APP_URL=http://localhost:3000',
        'NEXT_PUBLIC_API_URL=http://localhost:3000/api'
      ],
      react: [
        'VITE_APP_URL=http://localhost:5173',
        'VITE_API_URL=http://localhost:3000/api'
      ],
      node: [
        'PORT=3000',
        'NODE_ENV=development'
      ],
      python: [
        'PORT=8000',
        'ENVIRONMENT=development'
      ]
    };

    const vars = [
      ...dbVars,
      ...(stackVars[this.config.stack] || []),
      '# Add your custom environment variables below',
      ''
    ];

    return vars.join('\n');
  }

  private generateTsConfig(): string {
    return JSON.stringify({
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
        "plugins": [{
          "name": "next"
        }],
        "paths": {
          "@/*": ["./*"]
        }
      },
      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      "exclude": ["node_modules"]
    }, null, 2);
  }

  private generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}`;
  }

  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig`;
  }

  private addGeneratedFiles(folder: JSZip): void {
    Object.entries(this.config.files).forEach(([path, content]) => {
      // Ensure path uses forward slashes and doesn't start with /
      const normalizedPath = path.replace(/\\/g, '/').replace(/^\//, '');
      
      // Split path into directories and file
      const parts = normalizedPath.split('/');
      const filename = parts.pop()!;
      
      // Create nested directories if needed
      let currentFolder = folder;
      if (parts.length > 0) {
        for (const part of parts) {
          currentFolder = currentFolder.folder(part)!;
        }
      }
      
      // Add file
      currentFolder.file(filename, content);
    });
  }
}
