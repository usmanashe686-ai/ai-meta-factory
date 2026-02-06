"use client";

import { 
  Download, 
  GitBranch, 
  Settings, 
  RefreshCw,
  Zap,
  Sparkles,
  Copy,
  Check,
  Globe,
  Lock,
  Brain,
  Cpu,
  Database as DbIcon,
  Layers,
  FileCode,
  Terminal,
  Package,
  Rocket,
  Cloud,
  Bot,
  Wand2
} from 'lucide-react';
import { useState } from 'react';

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
  gitProvider,
  session
}: EnhancedCanvasControlsProps) {
  const [copied, setCopied] = useState(false);
  const [aiMode, setAiMode] = useState('auto');
  const [activeTab, setActiveTab] = useState('ai');

  const handleCopyConfig = () => {
    const config = {
      projectName,
      stack,
      database,
      gitProvider,
      aiMode
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'export', label: 'Export', icon: Package },
    { id: 'deploy', label: 'Deploy', icon: Rocket },
    { id: 'config', label: 'Config', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Project Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-full bg-transparent text-lg font-bold text-white placeholder-gray-500 focus:outline-none"
              placeholder="Project Name"
            />
            <p className="text-xs text-gray-400 mt-1">AI-powered development workspace</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/30 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">Files</div>
            <div className="text-sm font-semibold">6</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">Lines</div>
            <div className="text-sm font-semibold">173</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">AI</div>
            <div className="text-sm font-semibold">Ready</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800/50">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-gray-800/30 border-b-2 border-blue-500' 
                    : 'hover:bg-gray-800/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : 'text-gray-500'}`} />
                <span className={`text-xs mt-1 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">AI Assistant</h3>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={onAIRegenerate}
                disabled={isGenerating}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group ${
                  isGenerating
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30'
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isGenerating ? 'bg-purple-500/30' : 'bg-purple-500/20'}`}>
                    <Wand2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">AI Help</div>
                    <div className="text-xs text-gray-400">Regenerate selected code</div>
                  </div>
                </div>
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-400" />
                )}
              </button>
              
              <button
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Cpu className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">AI Regenerate</div>
                    <div className="text-xs text-gray-400">Full component rewrite</div>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-800/50">
              <div className="text-xs text-gray-400 mb-3">AI Mode</div>
              <div className="grid grid-cols-2 gap-2">
                {['auto', 'suggest', 'review', 'test'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAiMode(mode)}
                    className={`py-2 px-3 rounded-lg text-xs transition-all ${
                      aiMode === mode
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-800/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Export & Deploy</h3>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={onExportProject}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Download className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Export Project (ZIP)</div>
                    <div className="text-xs text-gray-400">Download all files</div>
                  </div>
                </div>
                <div className="text-xs px-2 py-1 bg-gray-800 rounded group-hover:bg-blue-500/20">
                  ZIP
                </div>
              </button>
              
              <button
                onClick={onPushToGitHub}
                disabled={!session?.accessToken}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group ${
                  session?.accessToken
                    ? 'border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-green-500/50 hover:bg-green-500/10'
                    : 'border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${session?.accessToken ? 'bg-green-500/20' : 'bg-gray-800'}`}>
                    <GitBranch className={`w-4 h-4 ${session?.accessToken ? 'text-green-400' : 'text-gray-500'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Push to GitHub</div>
                    <div className="text-xs text-gray-400">
                      {session?.accessToken ? 'Commit and push' : 'Connect GitHub first'}
                    </div>
                  </div>
                </div>
                {session?.accessToken ? (
                  <div className="text-xs px-2 py-1 bg-gray-800 rounded group-hover:bg-green-500/20">
                    Push
                  </div>
                ) : (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-800/50">
              <div className="text-xs text-gray-400 mb-3">Generate More</div>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors text-xs">
                  Components
                </button>
                <button className="p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors text-xs">
                  Pages
                </button>
                <button className="p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors text-xs">
                  API Routes
                </button>
                <button className="p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors text-xs">
                  Styles
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Deploy</h3>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Terminal className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Deploy to Vercel</div>
                    <div className="text-xs text-gray-400">One-click deployment</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Cloud className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Deploy to Netlify</div>
                    <div className="text-xs text-gray-400">Continuous deployment</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-white">Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-2">Stack</label>
                <div className="px-3 py-2 bg-gray-800/30 rounded-lg text-sm">
                  {stack}
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-2">Database</label>
                <div className="px-3 py-2 bg-gray-800/30 rounded-lg text-sm">
                  {database}
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-2">Git Provider</label>
                <div className="px-3 py-2 bg-gray-800/30 rounded-lg text-sm">
                  {gitProvider}
                </div>
              </div>
              
              <button
                onClick={handleCopyConfig}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:bg-gray-800 transition-all"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {copied ? 'Copied!' : 'Copy Configuration'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t border-gray-800/50 bg-gray-900/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-400">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <DbIcon className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300">{database}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
