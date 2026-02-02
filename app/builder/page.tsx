"use client";

import { useState, useEffect } from 'react';
import { 
  Code, Database, GitBranch, Cloud, Zap, 
  ChevronRight, Check, Settings, Download,
  Layout, Package 
} from 'lucide-react';
import HonestAIPipeline from './components/HonestAIPipeline';
import FullStackFactory from './components/FullStackFactory';
import Link from 'next/link';
import CanvasPanel from '@/components/canvas/CanvasPanel';
import { exportAsZip } from '@/lib/utils/zipUtils'; // NEW IMPORT

type TabType = 'component' | 'fullstack' | 'canvas' | 'export';
type ModeType = 'nextjs' | 'react' | 'flutter' | 'node' | 'python';
type DatabaseType = 'supabase' | 'firebase' | 'mongodb' | 'planetscale' | 'none';
type GitProviderType = 'github' | 'gitlab' | 'bitbucket';

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState<TabType>('component');
  const [mode, setMode] = useState<ModeType>('nextjs');
  const [database, setDatabase] = useState<DatabaseType>('supabase');
  const [gitProvider, setGitProvider] = useState<GitProviderType>('github');
  const [connectedGit, setConnectedGit] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // NEW: Export loading state
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
    planetscale: { name: 'PlanetScale', icon: '🟣', color: 'bg-purple-600', textColor: 'text-white' },
    none: { name: 'No Database', icon: '⚪', color: 'bg-gray-300', textColor: 'text-gray-700' }
  } as const;
  
  const gitConfigs = {
    github: { name: 'GitHub', icon: '🐙', color: 'bg-gray-800', textColor: 'text-white' },
    gitlab: { name: 'GitLab', icon: '🦊', color: 'bg-orange-600', textColor: 'text-white' },
    bitbucket: { name: 'BitBucket', icon: '🐋', color: 'bg-blue-700', textColor: 'text-white' }
  } as const;
  
  const connectGitHub = () => {
    setIsConfiguring(true);
    setTimeout(() => {
      setConnectedGit(true);
      setIsConfiguring(false);
    }, 1500);
  };
  
  const captureBaseline = () => {
    if (Object.keys(generatedFiles).length > 0) {
      setBaseFiles({ ...generatedFiles });
    }
  };
  
  const handleGenerateComponents = () => {
    const mockFiles = {
      'components/Button.tsx': `import React from 'react';\n\ninterface ButtonProps {\n  label: string;\n  variant?: 'primary' | 'secondary';\n}\n\nexport default function Button({ label, variant = 'primary' }: ButtonProps) {\n  return (\n    <button \n      className={\`px-4 py-2 rounded-lg font-medium \${variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}\`}\n    >\n      {label}\n    </button>\n  );\n}`,
      'components/Card.tsx': `import React from 'react';\n\ninterface CardProps {\n  title: string;\n  children: React.ReactNode;\n}\n\nexport default function Card({ title, children }: CardProps) {\n  return (\n    <div className="bg-white rounded-xl shadow-sm border p-6">\n      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>\n      <div className="text-gray-700">\n        {children}\n      </div>\n    </div>\n  );\n}`,
      'lib/utils.ts': `export function formatDate(date: Date): string {\n  return date.toLocaleDateString('en-US', {\n    year: 'numeric',\n    month: 'long',\n    day: 'numeric',\n  });\n}\n\nexport function generateId(): string {\n  return Math.random().toString(36).substring(2) + Date.now().toString(36);\n}`
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
  
  // UPDATED: Real ZIP export
  const handleExportZip = async () => {
    const totalFiles = Object.keys(generatedFiles).length;
    if (totalFiles === 0) {
      alert('No files to export. Generate components first.');
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Create ZIP
      const result = await exportAsZip(generatedFiles, `ai-meta-factory-${modeConfigs[mode].name}`);
      
      if (result.success) {
        alert(`✅ Successfully exported ${result.fileCount} files as ZIP!`);
      } else {
        alert(`❌ Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const tabs = [
    { id: 'component' as TabType, label: 'AI Component Generator', icon: <Zap className="w-4 h-4" /> },
    { id: 'fullstack' as TabType, label: 'Full-Stack Factory', icon: <Package className="w-4 h-4" /> },
    { id: 'canvas' as TabType, label: 'Canvas', icon: <Layout className="w-4 h-4" /> },
    { id: 'export' as TabType, label: 'Export & Deploy', icon: <Cloud className="w-4 h-4" /> }
  ];
  
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
              <button
                onClick={connectGitHub}
                disabled={isConfiguring || connectedGit}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                  connectedGit
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-900 text-white hover:bg-black'
                } disabled:opacity-50`}
              >
                {connectedGit ? (
                  <>
                    <Check className="w-4 h-4" />
                    Connected to GitHub
                  </>
                ) : isConfiguring ? (
                  'Connecting...'
                ) : (
                  <>
                    <GitBranch className="w-4 h-4" />
                    Connect GitHub
                  </>
                )}
              </button>
              
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
                  {connectedGit ? '✅ Ready to export' : '🔗 Connect GitHub to export'}
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
                    onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
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
                    onClick={connectGitHub}
                    disabled={!connectedGit}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {connectedGit ? '🚀 Export Project' : '🔗 Connect GitHub First'}
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
              isGitConnected={connectedGit}
              onExport={() => {
                if (!connectedGit) {
                  alert('Connect GitHub first to export projects.');
                  return;
                }
                alert(`Exporting ${modeConfigs[mode].name} project with ${databaseConfigs[database].name} to ${gitConfigs[gitProvider].name}...`);
              }}
            />
          )}
          
          {activeTab === 'canvas' && (
            <div className="min-h-[500px]">
              <CanvasPanel
                baseFiles={baseFiles}
                generatedFiles={generatedFiles}
                onGenerateComponents={handleGenerateComponents}
                onFilesChange={handleFileChange}
                onExportZip={handleExportZip}
              />
            </div>
          )}
          
          {activeTab === 'export' && (
            <div className="bg-white rounded-2xl border shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">📦 Export & Deploy</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Download ZIP Card - UPDATED */}
                <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                  <div className="relative">
                    {isExporting && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Download ZIP</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Complete project files with configuration
                    </p>
                    <button
                      onClick={handleExportZip}
                      disabled={isExporting || Object.keys(generatedFiles).length === 0}
                      className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Project
                        </>
                      )}
                    </button>
                    {Object.keys(generatedFiles).length > 0 && (
                      <p className="text-xs text-gray-500 mt-3">
                        {Object.keys(generatedFiles).length} files ready
                      </p>
                    )}
                  </div>
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
                    onClick={connectGitHub}
                    disabled={!connectedGit}
                    className="w-full py-3 bg-gray-800 text-white font-medium rounded-lg disabled:opacity-50"
                  >
                    {connectedGit ? 'Push to GitHub' : 'Connect GitHub First'}
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
                    <div className={`font-medium ${connectedGit ? 'text-green-600' : 'text-red-600'}`}>
                      {connectedGit ? '✅ Connected' : '❌ Not Connected'}
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
