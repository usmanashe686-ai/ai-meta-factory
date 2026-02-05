"use client";

import { signIn, signOut } from 'next-auth/react';
import { Brain, Download, Upload, Zap, Settings, Database, Terminal, User, LogOut } from 'lucide-react';

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
  database,
  session
}: EnhancedCanvasControlsProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Auth Section */}
      <div className="p-4 border-b border-gray-800">
        {session ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={session.user?.image || ''} 
                alt={session.user?.name || ''}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium">{session.user?.name}</p>
                <p className="text-xs text-gray-400">Connected to GitHub</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-gray-800 rounded"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('github')}
            className="w-full px-4 py-3 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            Sign in with GitHub
          </button>
        )}
      </div>

      {/* Project Settings */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Project Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="my-ai-project"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Stack
              </label>
              <div className="px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-300">
                {stack}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Database className="w-3 h-3 inline mr-1" />
                Database
              </label>
              <div className="px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-300">
                {database}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Controls */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI Enhancement
        </h3>
        
        <button
          onClick={onAIRegenerate}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              AI Help / Regenerate
            </>
          )}
        </button>
      </div>

      {/* Deployment Controls */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Export & Deploy
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onExportProject}
            className="w-full px-4 py-3 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Project (ZIP)
          </button>

          <button
            onClick={onPushToGitHub}
            disabled={!session || isGenerating}
            className="w-full px-4 py-3 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {session ? 'Push to GitHub' : 'Sign in to Push'}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Status
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">AI Service</span>
            <span className="text-green-400">✓ Connected</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">GitHub</span>
            <span className={session ? 'text-green-400' : 'text-yellow-400'}>
              {session ? '✓ Connected' : '◐ Not connected'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Code Analysis</span>
            <span className="text-green-400">✓ Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
