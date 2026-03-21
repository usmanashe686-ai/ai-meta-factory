'use client';

import { useEffect } from 'react';
import { useProjectStore } from '../state/project-store';
import { CodeEditor } from '../editor/CodeEditor';

export function EnhancedCanvasLayout() {
  const { createBlankProject, files, activeFileId, setActiveFile } = useProjectStore();

  useEffect(() => {
    createBlankProject();
  }, []);

  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFile(files[0].id);
    }
  }, [files, activeFileId]);

  if (!files || files.length === 0 || !activeFileId) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading safe mode...
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black">
      <CodeEditor />
    </div>
  );
}
