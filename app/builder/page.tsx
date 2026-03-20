"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useProjectStore } from './components/canvas/state/project-store';
import { EnhancedFileTree } from './components/canvas/EnhancedFileTree';

// Dynamically import to keep the build stable
const EnhancedCanvasPanel = dynamic(
  () => import('./components/canvas/EnhancedCanvasPanel').then(mod => mod.EnhancedCanvasPanel),
  { 
    ssr: false, 
    loading: () => <div className="h-screen bg-gray-900 animate-pulse flex-1" /> 
  }
);

export default function BuilderPage() {
  const { project, createBlankProject } = useProjectStore();

  useEffect(() => {
    // Auto-initialize project if empty
    if (!project) {
      createBlankProject("My First AI Project");
    }
  }, [project, createBlankProject]);

  return (
    <div className="h-screen bg-[#0d0d0f] overflow-hidden flex">
      {/* Sidebar - The Navigator */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0d0d0f]">
        <EnhancedFileTree />
      </aside>

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <EnhancedCanvasPanel />
      </main>
    </div>
  );
}
