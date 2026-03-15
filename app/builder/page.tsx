"use client";
import React from 'react';
import dynamic from 'next/dynamic';

// 1. Optimized Heavy Imports
const AIChatSidebar = dynamic(
  () => import("@/components/builder/sidebar/ai-chat-sidebar").then(mod => mod.AIChatSidebar),
  { ssr: false, loading: () => <div className="w-64 animate-pulse bg-gray-800" /> }
);

const EnhancedCanvasPanel = dynamic(
  () => import('./components/canvas/EnhancedCanvasPanel').then(mod => mod.EnhancedCanvasPanel),
  { ssr: false, loading: () => <div className="flex-1 animate-pulse bg-gray-900" /> }
);

const EditorPanel = dynamic(
  () => import("@/components/builder/editor/editor-panel").then(mod => mod.EditorPanel),
  { ssr: false, loading: () => <div className="h-full w-full bg-black" /> }
);

export default function BuilderPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white">
      {/* Left Side: AI Tools */}
      <AIChatSidebar />

      {/* Center & Right: The Workspace */}
      <main className="flex flex-1 flex-col relative">
        <div className="flex flex-1 h-full w-full">
          <EnhancedCanvasPanel />
          <EditorPanel />
        </div>
      </main>
    </div>
  );
}
