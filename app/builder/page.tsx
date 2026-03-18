"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useProjectStore } from './components/canvas/state/project-store';

// Dynamically import the heavy canvas component to prevent hydration errors
const EnhancedCanvasPanel = dynamic(
  () => import('./components/canvas/EnhancedCanvasPanel').then(mod => mod.EnhancedCanvasPanel),
  {
    ssr: false,
    loading: () => <div className="h-screen bg-gray-900 animate-pulse" />,
  }
);

export default function BuilderPage() {
  const { project, createBlankProject } = useProjectStore();

  useEffect(() => {
    // If no project is loaded in the store, create one automatically
    // This ensures App.tsx is created and selected on the first visit
    if (!project) {
      createBlankProject("My First AI Project");
    }
  }, [project, createBlankProject]);

  return (
    <div className="h-screen bg-gray-900 overflow-hidden flex flex-col">
      <EnhancedCanvasPanel />
    </div>
  );
}
