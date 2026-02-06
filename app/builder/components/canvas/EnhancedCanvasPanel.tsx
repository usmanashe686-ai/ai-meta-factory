"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { EnhancedFileTree } from './EnhancedFileTree';
import { EnhancedCodeEditor } from './EnhancedCodeEditor';
import { EnhancedCanvasControls } from './EnhancedCanvasControls';
import { OpenAIService } from '@/lib/ai/openai-service';
import { RealGitHubHandler } from '@/lib/github/real-handler';
import { EnhancedProjectExporter } from '@/lib/export/enhanced-exporter';
import { 
  Plus, FolderPlus, Upload, Zap, Sparkles, 
  Code, FileCode, Terminal, Package, Database,
  Brain, Rocket, Layout, Component, Server
} from 'lucide-react';

interface EnhancedCanvasPanelProps {
  initialFiles?: Record<string, string>;
  onFilesChange?: (files: Record<string, string>) => void;
  stack: string;
  database: string;
  gitProvider: string;
  projectName: string;
  session?: any;
}

export function EnhancedCanvasPanel({
  initialFiles = {},
  onFilesChange,
  stack,
  database,
  gitProvider,
  projectName: initialProjectName,
  session: propSession
}: EnhancedCanvasPanelProps) {
  const { data: session } = useSession();
  const activeSession = propSession || session;
  
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectName, setProjectName] = useState(initialProjectName);
  const [showWelcome, setShowWelcome] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');

  // Initialize services
  const aiService = new OpenAIService();
  const projectExporter = new EnhancedProjectExporter();

  // Initialize with starter templates if no files
  useEffect(() => {
    if (Object.keys(files).length === 0) {
      const starterFiles = getStarterFiles(stack, database);
      setFiles(starterFiles);
      setActiveFile(Object.keys(starterFiles)[0]);
      setShowWelcome(false);
    }
  }, [stack, database]);

  const handleFileSelect = (path: string) => {
    setActiveFile(path);
  };

  const handleFileChange = (path: string, content: string) => {
    const newFiles = { ...files, [path]: content };
    setFiles(newFiles);
    if (onFilesChange) onFilesChange(newFiles);
  };

  const handleFileDelete = (path: string) => {
    const newFiles = { ...files };
    delete newFiles[path];
    setFiles(newFiles);
    
    if (activeFile === path) {
      setActiveFile(Object.keys(newFiles)[0] || null);
    }
  };

  const handleFileCreate = (type: 'file' | 'folder', path: string) => {
    if (type === 'file') {
      const content = getDefaultContent(path, stack);
      const newFiles = { ...files, [path]: content };
      setFiles(newFiles);
      setActiveFile(path);
      setShowWelcome(false);
    } else {
      // Create folder with index file
      const folderPath = `${path}/index.ts`;
      const content = getDefaultContent(folderPath, stack);
      const newFiles = { ...files, [folderPath]: content };
      setFiles(newFiles);
      setActiveFile(folderPath);
      setShowWelcome(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const newFiles = { ...files };
    for (const file of Array.from(fileList)) {
      const content = await file.text();
      const path = `uploads/${file.name}`;
      newFiles[path] = content;
    }
    
    setFiles(newFiles);
    setShowWelcome(false);
  };

  const getStarterFiles = (stack: string, db: string): Record<string, string> => {
    const baseFiles = {
      'package.json': JSON.stringify({
        name: projectName,
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
          ...(stack === 'nextjs' && { '@next-auth/prisma-adapter': '^1.0.0' }),
          ...(db === 'supabase' && { '@supabase/supabase-js': '^2.0.0' }),
          ...(db === 'mongodb' && { mongodb: '^6.0.0' })
        }
      }, null, 2),

      'README.md': `# ${projectName}

## 🚀 Getting Started

This project was created with **AI Meta Factory**.

### Features
- Built with ${stack}
- Database: ${database}
- Ready for deployment

### Development
\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.
`,

      '.gitignore': `node_modules
.next
.env.local
.env*.local
*.log
`,

      'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
};

module.exports = nextConfig;`
    };

    // Add stack-specific files
    if (stack === 'nextjs') {
      Object.assign(baseFiles, {
        'app/page.tsx': `import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">${projectName}</span>
          </h1>
          <p className="text-xl text-gray-600">
            Built with AI Meta Factory • ${stack} • ${database}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Development</h3>
            <p className="text-gray-600">AI-powered code generation and enhancement.</p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">${database} Database</h3>
            <p className="text-gray-600">Fully integrated database setup.</p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Server className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Deploy</h3>
            <p className="text-gray-600">One-click deployment to Vercel.</p>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="px-8">
            Get Started
          </Button>
        </div>
      </div>
    </main>
  );
}`,

        'components/ui/button.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          variant === "link" && "text-primary underline-offset-4 hover:underline",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-11 rounded-md px-8",
          size === "icon" && "h-10 w-10",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };`,

        'components/ui/card.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };`,

        'lib/utils.ts': `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,

        'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}`
      });
    }

    return baseFiles;
  };

  const getDefaultContent = (path: string, stack: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const fileName = path.split('/').pop() || 'NewFile';
    
    switch (ext) {
      case 'tsx':
        return `import React from 'react';

interface ${fileName.replace(/\.tsx$/, '')}Props {
  // Add props here
}

export default function ${fileName.replace(/\.tsx$/, '')}({ 
  // Destructure props
}: ${fileName.replace(/\.tsx$/, '')}Props) {
  return (
    <div className="${fileName.replace(/\.tsx$/, '').toLowerCase()}">
      <h1>${fileName.replace(/\.tsx$/, '')} Component</h1>
      <p>Start building your component here.</p>
    </div>
  );
}`;

      case 'ts':
        return `// ${fileName}
// TypeScript utility file

export const ${fileName.replace(/\.ts$/, '').replace(/[^a-zA-Z0-9]/g, '_')} = () => {
  // Your TypeScript code here
  return "Hello from ${fileName}";
};`;

      case 'js':
      case 'jsx':
        return `// ${fileName}
// JavaScript/React component

export default function ${fileName.replace(/\.(js|jsx)$/, '')}() {
  return (
    <div>
      <h1>${fileName.replace(/\.(js|jsx)$/, '')}</h1>
      <p>Start coding...</p>
    </div>
  );
}`;

      case 'css':
      case 'scss':
        return `/* ${fileName} */
/* Styles for your application */

.${fileName.replace(/\.(css|scss)$/, '').toLowerCase()} {
  /* Add your styles here */
}`;

      case 'json':
        return `{
  "${fileName.replace(/\.json$/, '')}": {
    "version": "1.0.0",
    "description": "Configuration file"
  }
}`;

      case 'md':
        return `# ${fileName.replace(/\.md$/, '')}

## Description
Documentation file created with AI Meta Factory.

## Usage
Edit this markdown file to document your project.`;

      default:
        return `// ${fileName}
// File created with AI Meta Factory
// Stack: ${stack}
// Database: ${database}
// Created: ${new Date().toLocaleDateString()}`;
    }
  };

  const handleAIRegenerate = async () => {
    if (!activeFile) {
      alert('Please select a file to enhance');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiService.regenerateWithAI({
        filePath: activeFile,
        currentCode: files[activeFile],
        originalCode: files[activeFile],
        changes: aiPrompt ? [aiPrompt] : ['Improve code quality', 'Add comments', 'Optimize performance'],
        context: { stack, database, feature: 'enhancement' }
      });
      
      const newFiles = { ...files, [activeFile]: result.generatedCode };
      setFiles(newFiles);
      
      alert(`✅ AI Enhancement Complete!\n${result.explanation}`);
      setAiPrompt('');
      
    } catch (error: any) {
      alert(`AI Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIGenerateFromPrompt = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter what you want to generate');
      return;
    }

    setIsGenerating(true);
    try {
      // For now, create a new file based on prompt
      const fileName = aiPrompt.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.tsx';
      const filePath = `components/${fileName}`;
      
      const result = await aiService.regenerateWithAI({
        filePath,
        currentCode: '// New component to be generated',
        originalCode: '',
        changes: [aiPrompt],
        context: { stack, database, feature: 'generation' }
      });
      
      const newFiles = { ...files, [filePath]: result.generatedCode };
      setFiles(newFiles);
      setActiveFile(filePath);
      setShowWelcome(false);
      
      alert(`✅ Generated new component: ${fileName}`);
      setAiPrompt('');
      
    } catch (error: any) {
      alert(`AI Generation Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportProject = async () => {
    try {
      await projectExporter.exportAsZip({
        projectName,
        stack,
        database,
        files,
        description: 'Generated by AI Meta Factory'
      });
    } catch (error: any) {
      alert(`Export Error: ${error.message}`);
    }
  };

  const handlePushToGitHub = async () => {
    if (!activeSession?.accessToken) {
      alert('Please sign in with GitHub first');
      return;
    }

    setIsGenerating(true);
    try {
      const githubHandler = new RealGitHubHandler(activeSession.accessToken);

      const result = await githubHandler.pushToGitHub({
        owner: activeSession.user?.name || 'user',
        repo: projectName,
        commitMessage: 'Initial commit from AI Meta Factory',
        files: Object.entries(files).map(([path, content]) => ({
          path,
          content
        })),
        createRepo: true,
        isPrivate: false
      });

      if (result.success) {
        window.open(result.repoUrl, '_blank');
        alert(`✅ Successfully pushed to GitHub!\nRepository: ${result.repoUrl}`);
      } else {
        alert(`GitHub Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`GitHub Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateFromTemplate = (template: string) => {
    const templates: Record<string, Record<string, string>> = {
      'dashboard': {
        'app/dashboard/page.tsx': `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-gray-500">Total users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$45,231</p>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+12.5%</p>
            <p className="text-sm text-gray-500">From last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Button>Generate Report</Button>
    </div>
  );
}`,
        'components/dashboard/stats-card.tsx': `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}`
      },
      'auth': {
        'app/auth/login/page.tsx': `import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            
            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}`,
        'components/ui/input.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };`,
        'components/ui/label.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };`
      }
    };

    if (templates[template]) {
      const newFiles = { ...files, ...templates[template] };
      setFiles(newFiles);
      setActiveFile(Object.keys(templates[template])[0]);
      setShowWelcome(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] bg-gradient-to-br from-gray-900 to-black text-gray-100 flex flex-col rounded-xl border border-gray-800 overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    AI Code Canvas
                  </span>
                </h1>
                <p className="text-sm text-gray-400">Build apps with AI-powered code generation</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-blue-900/40 text-blue-300 text-sm rounded-full flex items-center gap-2">
                <Code className="w-3 h-3" />
                {stack.toUpperCase()}
              </span>
              <span className="px-3 py-1.5 bg-green-900/40 text-green-300 text-sm rounded-full flex items-center gap-2">
                <Database className="w-3 h-3" />
                {database.toUpperCase()}
              </span>
              <span className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-full">
                {gitProvider.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-400">
              <span className="font-medium text-white">{Object.keys(files).length}</span> files •{' '}
              <span className="font-medium text-white">
                {Object.values(files).reduce((sum, c) => sum + c.split('\n').length, 0)}
              </span> lines
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowWelcome(!showWelcome)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Quick Start
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Tree */}
        <div className="w-72 border-r border-gray-800 flex flex-col bg-gray-900/50">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-300">Workspace</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFileCreate('file', 'new-file.tsx')}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                  title="New File"
                >
                  <FileCode className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleFileCreate('folder', 'components')}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                  title="New Folder"
                >
                  <FolderPlus className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="What do you want to build? (e.g., 'login form with validation')"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm placeholder-gray-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAIGenerateFromPrompt()}
              />
              {aiPrompt && (
                <button
                  onClick={handleAIGenerateFromPrompt}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-sm"
                >
                  Generate
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <EnhancedFileTree
              files={files}
              onFileSelect={handleFileSelect}
              onFileChange={handleFileChange}
              onFileDelete={handleFileDelete}
              onFileCreate={handleFileCreate}
              activeFile={activeFile}
            />
          </div>
        </div>
        
        {/* Middle - Code Editor or Welcome */}
        <div className="flex-1 flex flex-col">
          {showWelcome ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-3xl text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Brain className="w-12 h-12 text-blue-400" />
                </div>
                
                <h2 className="text-3xl font-bold mb-4">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI Code Canvas</span>
                </h2>
                <p className="text-gray-400 mb-8 text-lg">
                  Start building your project with AI-powered code generation
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => handleCreateFromTemplate('dashboard')}
                    className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-blue-500 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Layout className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Dashboard Template</h3>
                    <p className="text-sm text-gray-400">Complete dashboard with cards and charts</p>
                  </button>
                  
                  <button
                    onClick={() => handleCreateFromTemplate('auth')}
                    className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-green-500 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Component className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Auth System</h3>
                    <p className="text-sm text-gray-400">Login, register, and authentication flows</p>
                  </button>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium"
                  >
                    Open Existing Files
                  </button>
                  <button
                    onClick={() => handleFileCreate('file', 'app/page.tsx')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-lg font-medium"
                  >
                    Create New File
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EnhancedCodeEditor
              files={files}
              onFileChange={handleFileChange}
              activeFile={activeFile}
            />
          )}
        </div>
        
        {/* Right Sidebar - Controls & AI */}
        <div className="w-96 border-l border-gray-800 bg-gray-900/50">
          <EnhancedCanvasControls
            onAIRegenerate={handleAIRegenerate}
            onExportProject={handleExportProject}
            onPushToGitHub={handlePushToGitHub}
            isGenerating={isGenerating}
            projectName={projectName}
            onProjectNameChange={setProjectName}
            stack={stack}
            onStackChange={() => {}}
            database={database}
            onDatabaseChange={() => {}}
            gitProvider={gitProvider}
            onGitProviderChange={() => {}}
            session={activeSession}
          />
        </div>
      </div>
    </div>
  );
}
