"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Code, Database, GitBranch, Cloud, Zap, ChevronRight, Check, Settings, Download, Layout, Package, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import HonestAIPipeline from './components/HonestAIPipeline';
import FullStackFactory from './components/FullStackFactory';
import EnhancedCanvasPanel from './components/canvas/EnhancedCanvasPanel';
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

  const getStackConfig = (): StackConfig => {
    let frontend: 'nextjs' | 'react' | 'flutter' = 'nextjs';
    let backend: 'node' | 'python' | 'none' = 'node';
    switch (mode) {
      case 'nextjs': frontend='nextjs'; backend='node'; break;
      case 'react': frontend='react'; backend='node'; break;
      case 'flutter': frontend='flutter'; backend='none'; break;
      case 'node': frontend='nextjs'; backend='node'; break;
      case 'python': frontend='nextjs'; backend='python'; break;
    }
    return { frontend, backend, database, gitProvider };
  };

  const handleGenerateComponents = () => {
    const mockFiles = {
      'src/components/Button.tsx': `export default function Button() { return <button>Button</button>; }`,
      'README.md': '# AI Meta Factory Project'
    };
    setGeneratedFiles(mockFiles);
    setTimeout(() => setBaseFiles(mockFiles), 500);
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
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">AI</div>
            <div>
              <h1 className="font-bold text-gray-900">AI Meta Factory</h1>
              <p className="text-xs text-gray-500">Builder Interface</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <img src={session.user?.image || ''} alt="User" className="w-8 h-8 rounded-full" />
                <span className="text-sm text-gray-700">{session.user?.name}</span>
                <Link href="/api/auth/signout" className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"><LogOut className="w-4 h-4" /></Link>
              </div>
            ) : (
              <Link href="/api/auth/signin" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-black transition-colors"><User className="w-4 h-4" />Sign in</Link>
            )}
          </div>
        </div>
        <div className="flex gap-1 mt-4 border-b max-w-7xl mx-auto px-6">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } transition-colors`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {activeTab === 'component' && (
          <div>
            <HonestAIPipeline />
            <div className="mt-6">
              <button 
                onClick={handleGenerateComponents} 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Generate Components
              </button>
            </div>
          </div>
        )}

        {activeTab === 'fullstack' && (
          <FullStackFactory
            selectedStack={mode}
            selectedDatabase={database}
            selectedGitProvider={gitProvider}
            isGitConnected={!!session}
            onExport={() => alert('Export triggered')}
          />
        )}

        {activeTab === 'canvas' && (
          <div className="min-h-[600px]">
            <EnhancedCanvasPanel
              initialFiles={{ ...baseFiles, ...generatedFiles }}
              onFilesChange={setGeneratedFiles}
              stack={stackConfig}
              projectName="ai-meta-factory-project"
              session={session}
            />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Export & Deploy</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download ZIP
                </button>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Deploy to Vercel
                </button>
                <button 
                  className={`px-4 py-2 ${session ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-lg transition-colors flex items-center gap-2`}
                  disabled={!session}
                >
                  <GitBranch className="w-4 h-4" />
                  Push to GitHub
                </button>
              </div>
              {!session && (
                <p className="text-sm text-gray-500">
                  Sign in to enable GitHub integration
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
