'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '../state/project-store';
import { CodeEditor } from '../editor/CodeEditor';
import { FileExplorer } from '../explorer/FileExplorer';
// Using the path confirmed by your find command
import { AIChatSidebar } from '../ai/AIChatSidebar';
import { UniversalPreview } from '../preview/UniversalPreview';

export function EnhancedCanvasLayout() {
  const { createBlankProject, files, activeFileId, setActiveFile } = useProjectStore();
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!files || files.length === 0) {
      createBlankProject();
    }
  }, [createBlankProject, files]);

  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFile(files[0].id);
    }
  }, [files, activeFileId, setActiveFile]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar - Visible on medium screens and up */}
      <div className="w-64 border-r border-zinc-800 flex-shrink-0 bg-[#0f0f0f] hidden md:block">
        <FileExplorer />
      </div>
      
      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#0f0f0f]">
          <span className="text-sm font-medium text-zinc-400">Editor</span>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} h-full transition-all duration-300`}>
            <CodeEditor />
          </div>
          
          {showPreview && (
            <div className="w-1/2 border-l border-zinc-800 bg-white">
              <UniversalPreview />
            </div>
          )}
        </div>
      </div>

      {/* AI Sidebar - Visible on large screens and up */}
      <div className="w-80 border-l border-zinc-800 flex-shrink-0 bg-[#0f0f0f] hidden lg:block">
        <AIChatSidebar />
      </div>
    </div>
  );
}
