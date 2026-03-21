'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '../state/project-store';
import { CodeEditor } from '../editor/CodeEditor';
import { FileExplorer } from '../explorer/FileExplorer';
import { AIChatSidebar } from '../ai/AIChatSidebar';
import { UniversalPreview } from '../preview/UniversalPreview';
import { FileCode, Folder, MessageSquare, Play } from 'lucide-react';

export function EnhancedCanvasLayout() {
  const { createBlankProject, files, activeFileId, setActiveFile } = useProjectStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'explorer' | 'editor' | 'ai' | 'preview'>('editor');

  useEffect(() => {
    setMounted(true);
    if (!files || files.length === 0) createBlankProject();
  }, [createBlankProject, files]);

  useEffect(() => {
    if (files.length > 0 && !activeFileId) setActiveFile(files[0].id);
  }, [files, activeFileId, setActiveFile]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Top Header */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 bg-[#0f0f0f] justify-between">
        <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI META FACTORY
        </span>
        <span className="text-xs text-zinc-500 uppercase tracking-widest">{activeTab}</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'explorer' && <div className="h-full w-full bg-[#0f0f0f]"><FileExplorer /></div>}
        {activeTab === 'editor' && <div className="h-full w-full"><CodeEditor /></div>}
        {activeTab === 'ai' && <div className="h-full w-full bg-[#0f0f0f]"><AIChatSidebar /></div>}
        {activeTab === 'preview' && <div className="h-full w-full bg-white"><UniversalPreview /></div>}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="h-16 border-t border-zinc-800 bg-[#0f0f0f] flex items-center justify-around px-2 pb-safe">
        <button onClick={() => setActiveTab('explorer')} className={`flex flex-col items-center gap-1 ${activeTab === 'explorer' ? 'text-blue-500' : 'text-zinc-500'}`}>
          <Folder size={20} />
          <span className="text-[10px]">Files</span>
        </button>
        <button onClick={() => setActiveTab('editor')} className={`flex flex-col items-center gap-1 ${activeTab === 'editor' ? 'text-blue-500' : 'text-zinc-500'}`}>
          <FileCode size={20} />
          <span className="text-[10px]">Code</span>
        </button>
        <button onClick={() => setActiveTab('ai')} className={`flex flex-col items-center gap-1 ${activeTab === 'ai' ? 'text-blue-500' : 'text-zinc-500'}`}>
          <MessageSquare size={20} />
          <span className="text-[10px]">AI Chat</span>
        </button>
        <button onClick={() => setActiveTab('preview')} className={`flex flex-col items-center gap-1 ${activeTab === 'preview' ? 'text-blue-500' : 'text-zinc-500'}`}>
          <Play size={20} />
          <span className="text-[10px]">Run</span>
        </button>
      </div>
    </div>
  );
}
