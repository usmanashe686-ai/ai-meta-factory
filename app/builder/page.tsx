"use client";

import { useState, useEffect } from 'react';
import HonestAIPipeline from './components/HonestAIPipeline';
import FullStackFactory from './components/FullStackFactory';

type TabType = 'component' | 'fullstack' | 'canvas' | 'code' | 'export';
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

  // Type-safe configs
  const modeConfigs: Record<ModeType, { name: string; icon: string; color: string }> = {
    nextjs: { name: 'Next.js', icon: '⚡', color: 'from-black to-gray-800' },
    react: { name: 'React', icon: '⚛️', color: 'from-blue-500 to-blue-700' },
    flutter: { name: 'Flutter', icon: '📱', color: 'from-blue-400 to-sky-500' },
    node: { name: 'Node.js', icon: '🟢', color: 'from-green-600 to-green-800' },
    python: { name: 'Python', icon: '🐍', color: 'from-yellow-500 to-blue-500' }
  };

  const databaseConfigs: Record<DatabaseType, { name: string; icon: string; color: string }> = {
    supabase: { name: 'Supabase', icon: '🟢', color: 'from-green-500 to-emerald-600' },
    firebase: { name: 'Firebase', icon: '🟠', color: 'from-orange-500 to-yellow-500' },
    mongodb: { name: 'MongoDB', icon: '🟩', color: 'from-green-600 to-green-400' },
    planetscale: { name: 'PlanetScale', icon: '🟣', color: 'from-purple-500 to-pink-500' },
    none: { name: 'No Database', icon: '⚪', color: 'from-gray-400 to-gray-600' }
  };

  const gitConfigs: Record<GitProviderType, { name: string; icon: string; color: string }> = {
    github: { name: 'GitHub', icon: '🐙', color: 'from-gray-800 to-gray-900' },
    gitlab: { name: 'GitLab', icon: '🦊', color: 'from-orange-600 to-red-500' },
    bitbucket: { name: 'BitBucket', icon: '🐋', color: 'from-blue-600 to-blue-800' }
  };

  const connectGitHub = () => {
    setIsConfiguring(true);
    setTimeout(() => {
      setConnectedGit(true);
      setIsConfiguring(false);
      alert('✅ GitHub connected! You can now export projects to your repositories.');
    }, 1500);
  };

  const exportProject = () => {
    if (!connectedGit) {
      alert('⚠️ Connect GitHub first to export projects.');
      return;
    }
    alert(`🚀 Exporting ${modeConfigs[mode].name} project with ${databaseConfigs[database].name} to ${gitConfigs[gitProvider].name}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🏭</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Meta Factory</h1>
                <p className="text-gray-600 text-sm">
                  Full-Stack AI Development Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Git Connection */}
              <div className="flex items-center gap-2">
                {connectedGit ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    <span>✅</span>
                    <span className="text-sm font-bold">GitHub Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={connectGitHub}
                    disabled={isConfiguring}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                  >
                    {isConfiguring ? 'Connecting...' : (
                      <>
                        <span>🔗</span>
                        <span className="font-bold">Connect GitHub</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex gap-1 mt-6">
            {[
              { id: 'component', label: '🧠 AI Component Generator', icon: '🧠' },
              { id: 'fullstack', label: '🏭 Full-Stack Factory', icon: '🏭' },
              { id: 'canvas', label: '🎨 Canvas', icon: '🎨' },
              { id: 'code', label: '💻 Code Editor', icon: '💻' },
              { id: 'export', label: '📦 Export & Deploy', icon: '📦' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-3 font-bold rounded-t-lg transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-t border-l border-r'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tech Stack Selector */}
        {(activeTab === 'component' || activeTab === 'fullstack') && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Tech Stack */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <span>⚙️</span>
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(modeConfigs) as [ModeType, typeof modeConfigs[ModeType]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setMode(key)}
                      className={`px-4 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                        mode === key
                          ? `bg-gradient-to-r ${config.color} text-white shadow-lg scale-105`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xl">{config.icon}</span>
                      <span>{config.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Database Selector */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <span>🗄️</span>
                  Database
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(databaseConfigs) as [DatabaseType, typeof databaseConfigs[DatabaseType]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setDatabase(key)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                        database === key
                          ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Git Provider */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <span>🔗</span>
                  Git Provider
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(gitConfigs) as [GitProviderType, typeof gitConfigs[GitProviderType]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setGitProvider(key)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                        gitProvider === key
                          ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${modeConfigs[mode].color} text-white font-bold`}>
                    {modeConfigs[mode].icon} {modeConfigs[mode].name}
                  </div>
                  <div className="text-gray-500">→</div>
                  <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${databaseConfigs[database].color} text-white font-bold`}>
                    {databaseConfigs[database].icon} {databaseConfigs[database].name}
                  </div>
                  <div className="text-gray-500">→</div>
                  <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${gitConfigs[gitProvider].color} text-white font-bold`}>
                    {gitConfigs[gitProvider].icon} {gitConfigs[gitProvider].name}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {connectedGit ? '✅ Ready to export' : '⚠️ Connect GitHub to export'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Component Generator Tab */}
        {activeTab === 'component' && (
          <div className="space-y-8">
            <HonestAIPipeline />
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <div className="text-2xl font-bold">{modeConfigs[mode].icon}</div>
                <div className="font-bold mt-2">{modeConfigs[mode].name}</div>
                <div className="text-sm text-gray-600">Tech Stack</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <div className="text-2xl font-bold">{databaseConfigs[database].icon}</div>
                <div className="font-bold mt-2">{databaseConfigs[database].name}</div>
                <div className="text-sm text-gray-600">Database</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <button
                  onClick={exportProject}
                  disabled={!connectedGit}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {connectedGit ? '🚀 Export Project' : '🔗 Connect GitHub First'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full-Stack Factory Tab */}
        {activeTab === 'fullstack' && (
          <div className="space-y-8">
            <FullStackFactory 
              selectedStack={mode}
              selectedDatabase={database}
              selectedGitProvider={gitProvider}
              isGitConnected={connectedGit}
              onExport={exportProject}
            />
          </div>
        )}

        {/* Canvas Tab */}
        {activeTab === 'canvas' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[500px]">
            <h2 className="text-2xl font-bold mb-6">🎨 Component Canvas</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">🖼️</div>
              <h3 className="text-xl font-bold mb-2">Drag & Drop Canvas</h3>
              <p className="text-gray-600 mb-4">Drag generated components here to build layouts</p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl">
                Generate Components First
              </button>
            </div>
          </div>
        )}

        {/* Code Editor Tab */}
        {activeTab === 'code' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[500px]">
            <h2 className="text-2xl font-bold mb-6">💻 Code Editor</h2>
            <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
              <div className="bg-gray-900 text-gray-300 px-4 py-2 flex justify-between">
                <div>generated-component.tsx</div>
                <button className="text-sm px-3 py-1 bg-blue-600 rounded">Copy</button>
              </div>
              <pre className="p-6 bg-gray-950 text-green-400 overflow-auto max-h-[400px]">
{`// Generated AI Component
import React from 'react';

interface ComponentProps {
  title: string;
  theme?: 'light' | 'dark';
}

const AIGeneratedComponent: React.FC<ComponentProps> = ({
  title,
  theme = 'dark'
}) => {
  return (
    <div className={\`p-6 rounded-xl \${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }\`}>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3">
        This component was AI-generated with ${modeConfigs[mode].name} 
        and ${databaseConfigs[database].name} configuration.
      </p>
    </div>
  );
};

export default AIGeneratedComponent;`}
              </pre>
            </div>
          </div>
        )}

        {/* Export & Deploy Tab */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6">📦 Export & Deploy</h2>
            
            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 hover:shadow-lg transition">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="font-bold mb-2">Download ZIP</h3>
                <p className="text-sm text-gray-600 mb-4">Complete project files</p>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg w-full">
                  Download
                </button>
              </div>
              
              <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-green-500 hover:shadow-lg transition">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="font-bold mb-2">Deploy to Vercel</h3>
                <p className="text-sm text-gray-600 mb-4">One-click deployment</p>
                <button className="px-4 py-2 bg-black text-white rounded-lg w-full">
                  Deploy Now
                </button>
              </div>
              
              <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-orange-500 hover:shadow-lg transition">
                <div className="text-4xl mb-4">🐙</div>
                <h3 className="font-bold mb-2">Push to GitHub</h3>
                <p className="text-sm text-gray-600 mb-4">Commit & push to repo</p>
                <button 
                  onClick={exportProject}
                  disabled={!connectedGit}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg w-full disabled:opacity-50"
                >
                  {connectedGit ? 'Push to GitHub' : 'Connect GitHub First'}
                </button>
              </div>
            </div>

            {/* Project Configuration */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold mb-4">Project Configuration</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Tech Stack</span>
                  <span className="font-bold">{modeConfigs[mode].name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Database</span>
                  <span className="font-bold">{databaseConfigs[database].name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Git Provider</span>
                  <span className="font-bold">{gitConfigs[gitProvider].name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Git Connection</span>
                  <span className={`font-bold ${connectedGit ? 'text-green-600' : 'text-red-600'}`}>
                    {connectedGit ? '✅ Connected' : '❌ Not Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
