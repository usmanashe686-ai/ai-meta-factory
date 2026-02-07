"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Code, Database, GitBranch, Cloud, Zap,
  ChevronRight, Check, Settings, Download,
  Layout, Package, User, LogOut
} from 'lucide-react';
import Link from 'next/link';
import HonestAIPipeline from './components/HonestAIPipeline';
import FullStackFactory from './components/FullStackFactory';
import { EnhancedCanvasPanel } from './components/canvas/EnhancedCanvasPanel';
import { StackConfig } from './components/canvas/types';

type TabType = 'component' | 'fullstack' | 'canvas' | 'export';
type ModeType = 'nextjs' | 'react' | 'flutter' | 'node' | 'python';
type DatabaseType = 'supabase' | 'firebase' | 'mongodb' | 'planetscale' | 'none';
type GitProviderType = 'github' | 'gitlab' | 'bitbucket';

export default function BuilderPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('component');
  const [mode, setMode] = useState<ModeType>('nextjs');
  const [database, setDatabase] = useState<DatabaseType>('supabase');
  const [gitProvider, setGitProvider] = useState<GitProviderType>('github');
  const [baseFiles, setBaseFiles] = useState<Record<string, string>>({});
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});

  const modeConfigs = {
    nextjs: { name: 'Next.js', icon: '⚡', color: 'bg-black', textColor: 'text-white' },
    react: { name: 'React', icon: '⚛️', color: 'bg-blue-600', textColor: 'text-white' },
    flutter: { name: 'Flutter', icon: '📱', color: 'bg-blue-400', textColor: 'text-white' },
    node: { name: 'Node.js', icon: '🟢', color: 'bg-green-600', textColor: 'text-white' },
    python: { name: 'Python', icon: '🐍', color: 'bg-gradient-to-r from-yellow-500 to-blue-500', textColor: 'text-white' }
  } as const;

  const databaseConfigs = {
    supabase: { name: 'Supabase', icon: '🟢', color: 'bg-green-500', textColor: 'text-white' },
    firebase: { name: 'Firebase', icon: '🟠', color: 'bg-orange-500', textColor: 'text-white' },
    mongodb: { name: 'MongoDB', icon: '🍃', color: 'bg-green-700', textColor: 'text-white' },
    planetscale: { name: 'PlanetScale', icon: '🪐', color: 'bg-purple-600', textColor: 'text-white' },
    none: { name: 'No Database', icon: '⚪', color: 'bg-gray-300', textColor: 'text-gray-700' }
  } as const;

  const gitConfigs = {
    github: { name: 'GitHub', icon: '🐙', color: 'bg-gray-800', textColor: 'text-white' },
    gitlab: { name: 'GitLab', icon: '🦊', color: 'bg-orange-600', textColor: 'text-white' },
    bitbucket: { name: 'BitBucket', icon: '🐋', color: 'bg-blue-700', textColor: 'text-white' }
  } as const;

  // Convert ModeType to proper StackConfig
  const getStackConfig = (): StackConfig => {
    // Determine frontend and backend from mode
    let frontend: 'nextjs' | 'react' | 'flutter' = 'nextjs';
    let backend: 'nodejs' | 'python' | 'none' = 'nodejs';
    
    switch (mode) {
      case 'nextjs':
        frontend = 'nextjs';
        backend = 'nodejs';
        break;
      case 'react':
        frontend = 'react';
        backend = 'nodejs';
        break;
      case 'flutter':
        frontend = 'flutter';
        backend = 'none';
        break;
      case 'node':
        frontend = 'nextjs'; // Default frontend for node backend
        backend = 'nodejs';
        break;
      case 'python':
        frontend = 'nextjs'; // Default frontend for python backend
        backend = 'python';
        break;
    }
    
    return {
      frontend,
      backend,
      database,
      gitProvider
    };
  };

  const handleGenerateComponents = () => {
    const mockFiles = {
      'src/components/Button.tsx': `import React from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  label,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
    >
      {label}
    </button>
  );
}`,
      'src/components/Card.tsx': `import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export default function Card({
  title,
  children,
  className = '',
  footer
}: CardProps) {
  return (
    <div className={\`bg-white rounded-xl shadow-sm border p-6 \${className}\`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="text-gray-700">
        {children}
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}`,
      'README.md': `# AI Generated Project

This project was generated by AI Meta Factory.

## Features
- Modern React components with TypeScript
- Responsive design
- Type-safe development
- AI-generated code

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Learn More
Visit [AI Meta Factory](https://ai-meta-factory.com) for more information.`
    };
    
    setGeneratedFiles(mockFiles);
    setTimeout(() => {
      setBaseFiles(mockFiles);
    }, 1000);
  };

  const handleFileChange = (fileName: string, content: string) => {
    setGeneratedFiles(prev => ({
      ...prev,
      [fileName]: content
    }));
  };

  const tabs = [
    { id: 'component' as TabType, label: 'AI Component Generator', icon: <Zap className="w-4 h-4" /> },
    { id: 'fullstack' as TabType, label: 'Full-Stack Factory', icon: <Package className="w-4 h-4" /> },
    { id: 'canvas' as TabType, label: 'Canvas', icon: <Layout className="w-4 h-4" /> },
    { id: 'export' as TabType, label: 'Export & Deploy', icon: <Cloud className="w-4 h-4" /> }
  ];

  const stackConfig = getStackConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">AI Meta Factory</h1>
                  <p className="text-xs text-gray-500">Builder Interface</p>
                </div>
              </Link>
              
              <div className="hidden md:flex items-center gap-1 ml-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-md ${modeConfigs[mode].color} ${modeConfigs[mode].textColor}`}>
                    {modeConfigs[mode].name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className={`px-3 py-1 rounded-md ${databaseConfigs[database].color} ${databaseConfigs[database].textColor}`}>
                    {databaseConfigs[database].name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className={`px-3 py-1 rounded-md ${gitConfigs[gitProvider].color} ${gitConfigs[gitProvider].textColor}`}>
                    {gitConfigs[gitProvider].name}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {session ? (
                <div className="flex items-center gap-3">
                  <img
                    src={session.user?.image || ''}
                    alt={session.user?.name || ''}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-700">{session.user?.name}</span>
                  <Link
                    href="/api/auth/signout"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-black flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Sign in
                </Link>
              )}
              
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
          
          {/* Main Navigation Tabs */}
          <div className="flex gap-1 mt-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Configuration Bar */}
        {(activeTab === 'component' || activeTab === 'fullstack') && (
          <div className="mb-8">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Project Configuration</h2>
                <div className="text-sm text-gray-500">
                  {session ? '✅ Ready to export' : ' 🔗 Sign in to export'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tech Stack Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Tech Stack
                  </label>
                  <div className="space-y-2">
                    {(Object.entries(modeConfigs) as [ModeType, typeof modeConfigs[keyof typeof modeConfigs]][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setMode(key)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between ${
                          mode === key
                            ? `${config.color} ${config.textColor} shadow-md`
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{config.icon}</span>
                          <span className="font-medium">{config.name}</span>
                        </div>
                        {mode === key && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Database Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Database
                  </label>
                  <div className="space-y-2">
                    {(Object.entries(databaseConfigs) as [DatabaseType, typeof databaseConfigs[keyof typeof databaseConfigs]][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setDatabase(key)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between ${
                          database === key
                            ? `${config.color} ${config.textColor} shadow-md`
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{config.icon}</span>
                          <span className="font-medium">{config.name}</span>
                        </div>
                        {database === key && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Git Provider Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Git Provider
                  </label>
                  <div className="space-y-2">
                    {(Object.entries(gitConfigs) as [GitProviderType, typeof gitConfigs[keyof typeof gitConfigs]][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setGitProvider(key)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between ${
                          gitProvider === key
                            ? `${config.color} ${config.textColor} shadow-md`
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{config.icon}</span>
                          <span className="font-medium">{config.name}</span>
                        </div>
                        {gitProvider === key && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Configuration Status */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">Current Stack:</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-md ${modeConfigs[mode].color} ${modeConfigs[mode].textColor} text-sm font-medium`}>
                        {modeConfigs[mode].name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className={`px-3 py-1 rounded-md ${databaseConfigs[database].color} ${databaseConfigs[database].textColor} text-sm font-medium`}>
                        {databaseConfigs[database].name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className={`px-3 py-1 rounded-md ${gitConfigs[gitProvider].color} ${gitConfigs[gitProvider].textColor} text-sm font-medium`}>
                        {gitConfigs[gitProvider].name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Need API Key?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Area */}
        <div className="space-y-8">
          {activeTab === 'component' && (
            <div className="space-y-8">
              <HonestAIPipeline />
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border text-center">
                  <div className={`text-2xl font-bold ${modeConfigs[mode].textColor} ${modeConfigs[mode].color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    {modeConfigs[mode].icon}
                  </div>
                  <div className="font-bold text-gray-900">{modeConfigs[mode].name}</div>
                  <div className="text-sm text-gray-600">Tech Stack</div>
                </div>
                <div className="bg-white p-6 rounded-xl border text-center">
                  <div className={`text-2xl font-bold ${databaseConfigs[database].textColor} ${databaseConfigs[database].color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    {databaseConfigs[database].icon}
                  </div>
                  <div className="font-bold text-gray-900">{databaseConfigs[database].name}</div>
                  <div className="text-sm text-gray-600">Database</div>
                </div>
                <div className="bg-white p-6 rounded-xl border text-center">
                  <button
                    onClick={handleGenerateComponents}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    🚀 Generate Components
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'fullstack' && (
            <FullStackFactory
              selectedStack={mode}
              selectedDatabase={database}
              selectedGitProvider={gitProvider}
              isGitConnected={!!session}
              onExport={() => {
                if (!session) {
                  alert('Sign in first to export projects.');
                  return;
                }
                alert(`Exporting ${modeConfigs[mode].name} project with ${databaseConfigs[database].name} to ${gitConfigs[gitProvider].name}...`);
              }}
            />
          )}
          
          {activeTab === 'canvas' && (
            <div className="min-h-[600px]">
              <EnhancedCanvasPanel
                initialFiles={{ ...baseFiles, ...generatedFiles }}
                onFilesChange={(files) => {
                  setGeneratedFiles(files);
                }}
                stack={stackConfig}
                projectName="ai-meta-factory-project"
                session={session}
              />
            </div>
          )}
          
          {activeTab === 'export' && (
            <div className="bg-white rounded-2xl border shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">📦 Export & Deploy</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Download ZIP</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Complete project files with configuration
                  </p>
                  <button
                    onClick={() => alert('ZIP export would be handled by EnhancedCanvasPanel')}
                    className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Project
                  </button>
                  {Object.keys(generatedFiles).length > 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                      {Object.keys(generatedFiles).length} files ready
                    </p>
                  )}
                </div>
                
                <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                  <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Deploy to Vercel</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    One-click deployment to production
                  </p>
                  <button className="w-full py-3 bg-black text-white font-medium rounded-lg hover:opacity-90">
                    Deploy Now
                  </button>
                </div>
                
                <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
                  <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Push to GitHub</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Commit & push to repository
                  </p>
                  <button
                    onClick={() => {
                      if (!session) {
                        alert('Please sign in first');
                      } else {
                        alert('GitHub push would be handled by EnhancedCanvasPanel');
                      }
                    }}
                    className={`w-full py-3 font-medium rounded-lg ${
                      session ? 'bg-gray-800 text-white hover:bg-black' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {session ? 'Push to GitHub' : 'Sign in Required'}
                  </button>
                </div>
              </div>
              
              {/* Project Configuration Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Project Configuration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Tech Stack</div>
                    <div className="font-medium">{modeConfigs[mode].name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Database</div>
                    <div className="font-medium">{databaseConfigs[database].name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Git Provider</div>
                    <div className="font-medium">{gitConfigs[gitProvider].name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className={`font-medium ${session ? 'text-green-600' : 'text-red-600'}`}>
                      {session ? '✅ Signed In' : '❌ Not Signed In'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
