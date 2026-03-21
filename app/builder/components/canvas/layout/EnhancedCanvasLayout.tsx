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
    if (!files || files.length === 0) {
      createBlankProject();
    }
  }, []);

  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFile(files[0].id);
    }
  }, [files, activeFileId]);

  if (!mounted || !files || files.length === 0 || !activeFileId) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading Sidebar...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden text-white">
      {/* Sidebar - Test if this causes crash */}
      <div className="w-64 border-r border-zinc-800 hidden md:block">
        <FileExplorer />
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative">
        <CodeEditor />
      </div>
    </div>
  );
}
