"use client";

import React, { useEffect } from 'react';
import { useProjectStore } from './state/project-store';
import { EnhancedCodeEditor } from './editor/EnhancedCodeEditor';

export const EnhancedCanvasPanel = () => {
  const store = useProjectStore();

  useEffect(() => {
    // If no project exists or no files are loaded, bootstrap the environment
    if (!store.project || store.files.length === 0) {
      store.createBlankProject("My First AI Project");
    }
  }, [store]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0f12] overflow-hidden">
      {/* Code Editor Container */}
      <div className="flex-1 relative border-t border-white/5">
        <EnhancedCodeEditor />
      </div>
    </div>
  );
};
