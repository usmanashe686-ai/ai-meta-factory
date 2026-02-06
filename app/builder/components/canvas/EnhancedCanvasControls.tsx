"use client";

import { signIn, signOut } from 'next-auth/react';
import { 
  Brain, Download, Upload, Zap, Settings, Database, 
  Terminal, User, LogOut, Rocket, Sparkles, Cpu,
  Server, Cloud, GitBranch, Shield, Wifi
} from 'lucide-react';

interface EnhancedCanvasControlsProps {
  onAIRegenerate: () => void;
  onExportProject: () => void;
  onPushToGitHub: () => void;
  isGenerating: boolean;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  stack: string;
  onStackChange: (stack: string) => void;
  database: string;
  onDatabaseChange: (db: string) => void;
  gitProvider: string;
  onGitProviderChange: (provider: string) => void;
  session: any;
}

export function EnhancedCanvasControls({
  onAIRegenerate,
  onExportProject,
  onPushToGitHub,
  isGenerating,
  projectName,
  onProjectNameChange,
  stack,
  onStackChange,
  database,
  onDatabaseChange,
  gitProvider,
  onGitProviderChange,
  session
}: EnhancedCanvasControlsProps) {
  const stacks = [
    { id: 'nextjs', name: 'Next.js', icon: '⚡', color: 'bg-black' },
    { id: 'react', name: 'React', icon: '⚛️', color: 'bg-blue-600' },
    { id: 'vue', name: 'Vue.js', icon: '🟢', color: 'bg-green-600' },
    { id: 'svelte', name: 'SvelteKit', icon: '🟠', color: 'bg-orange-500' },
  ];

  const databases = [
    { id: 'supabase', name: 'Supabase', icon: '🟢', color: 'bg-green-500' },
    { id: 'firebase', name: 'Firebase', icon: '🟠', color: 'bg-orange-500' },
    { id: 'mongodb', name: 'MongoDB', icon: '🍃', color: 'bg-green-700' },
    { id: 'postgresql', name: 'PostgreSQL', icon: '🐘', color: 'bg-blue-700' },
  ];

  const providers = [
    { id: 'github', name: 'GitHub', icon: '🐙', color: 'bg-gray-800' },
    { id: 'gitlab', name: 'GitLab', icon: '🦊', color: 'bg-orange-600' },
    { id: 'bitbucket', name: 'BitBucket', icon: '🐋', color: 'bg-blue-700' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Auth Section */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black">
        {session ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={session.user?.image || ''} 
                  alt={session.user?.name || ''}
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{session.user?.name}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected to GitHub
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-gray-800 rounded-lg"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Access Level</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Full Access</span>
                <Shield className="w-4 h-4 text-green-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-4">Sign in to save and deploy projects</p>
            </div>
            <button
              onClick={() => signIn('github')}
              className="w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-medium flex items-center justify-center gap-3"
            >
              <GitBranch className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>
        )}
      </div>

      {/* AI Superpowers Section */}
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Superpowers
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onAIRegenerate}
            disabled={isGenerating}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3 font-medium"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                AI is thinking...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Enhance Current File
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg flex flex-col items-center">
              <Cpu className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-sm">Fix Bugs</span>
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg flex flex-col items-center">
              <Brain className="w-6 h-6 text-purple-400 mb-2" />
              <span className="text-sm">Optimize</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Configuration */}
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Project Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-2">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
              placeholder="my-awesome-project"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Stack</label>
            <div className="flex flex-wrap gap-2">
              {stacks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onStackChange(s.id)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 ${stack === s.id ? s.color + ' text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  <span>{s.icon}</span>
                  <span className="text-sm">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Database</label>
            <div className="flex flex-wrap gap-2">
              {databases.map((db) => (
                <button
                  key={db.id}
                  onClick={() => onDatabaseChange(db.id)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 ${database === db.id ? db.color + ' text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  <span>{db.icon}</span>
                  <span className="text-sm">{db.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Section */}
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <Rocket className="w-4 h-4" />
          Deployment
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onExportProject}
            className="w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl flex items-center justify-center gap-3 font-medium"
          >
            <Download className="w-5 h-5" />
            Export Project (ZIP)
          </button>

          <button
            onClick={onPushToGitHub}
            disabled={!session || isGenerating}
            className={`w-full px-6 py-4 rounded-xl flex items-center justify-center gap-3 font-medium ${
              session 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                : 'bg-gray-900 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Upload className="w-5 h-5" />
            {session ? 'Push to GitHub & Deploy' : 'Sign in to Deploy'}
          </button>
        </div>
      </div>

      {/* Status Panel */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">System Status</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm">AI Service</p>
                <p className="text-xs text-gray-500">OpenRouter API</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Connected</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Server className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm">Backend API</p>
                <p className="text-xs text-gray-500">Server Status</p>
              </div>
            </div>
            <span className="text-sm text-green-400">✓ Online</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Cloud className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm">Deployment</p>
                <p className="text-xs text-gray-500">Vercel Ready</p>
              </div>
            </div>
            <span className="text-sm text-green-400">✓ Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
