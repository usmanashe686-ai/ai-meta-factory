'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '../state/project-store';
import { CodeEditor } from '../editor/CodeEditor';
import { FileExplorer } from '../explorer/FileExplorer';

export function EnhancedCanvasLayout() {
  const { createBlankProject, files, activeFileId, setActiveFile } = useProjectStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only create a project if the store is empty
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
      {/* Sidebar - Testing if FileExplorer is stable */}
      <div className="w-64 border-r border-zinc-800 flex-shrink-0 bg-[#0f0f0f]">
        <FileExplorer />
      </div>
      
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <div className="flex-1 overflow-hidden">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}
