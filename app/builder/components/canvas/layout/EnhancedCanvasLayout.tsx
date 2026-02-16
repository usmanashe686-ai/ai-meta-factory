'use client';

import { useEffect, useState } from 'react';
import { ResizablePanels } from './ResizablePanels';
import { FileExplorer } from '../explorer/FileExplorer';
import { CodeEditor } from '../editor/CodeEditor';
import { UniversalPreview } from '../preview/UniversalPreview';
import { CanvasToolbar } from '../toolbar/CanvasToolbar';
import { AIChatSidebar } from '../ai/AIChatSidebar';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';
import { useUIStore } from '../state/ui-store';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function EnhancedCanvasLayout() {
  const { project, createBlankProject } = useProjectStore();
  const { platform } = usePlatformStore();
  const { isAIPanelOpen } = useUIStore();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-create a blank project if none exists
  useEffect(() => {
    if (!project) {
      createBlankProject();
    }
  }, [project, createBlankProject]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Creating blank workspace...</p>
      </div>
    );
  }

  // Mobile layout: stack panels vertically, only one visible at a time
  if (isMobile) {
    const [mobileTab, setMobileTab] = useState<'explorer' | 'editor' | 'preview' | 'ai'>('editor');
    return (
      <div className="flex h-screen flex-col bg-gray-900">
        <CanvasToolbar />
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            className={`flex-1 py-2 text-sm font-medium ${mobileTab === 'explorer' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setMobileTab('explorer')}
          >
            Explorer
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${mobileTab === 'editor' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setMobileTab('editor')}
          >
            Editor
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${mobileTab === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setMobileTab('preview')}
          >
            Preview
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${mobileTab === 'ai' ? 'bg-purple-700 text-white' : 'text-gray-400'}`}
            onClick={() => setMobileTab('ai')}
          >
            AI
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'explorer' && <FileExplorer />}
          {mobileTab === 'editor' && <CodeEditor />}
          {mobileTab === 'preview' && <UniversalPreview />}
          {mobileTab === 'ai' && <AIChatSidebar />}
        </div>
      </div>
    );
  }

  // Desktop layout with resizable panels and AI sidebar overlay
  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <CanvasToolbar />
      <div className="flex-1 overflow-hidden relative">
        <ResizablePanels
          left={leftCollapsed ? null : <FileExplorer />}
          center={<CodeEditor />}
          right={rightCollapsed ? null : <UniversalPreview />}
          leftSize={leftCollapsed ? 0 : 18}
          rightSize={rightCollapsed ? 0 : 35}
          minLeftSize={leftCollapsed ? 0 : 15}
          minRightSize={rightCollapsed ? 0 : 25}
          onLeftToggle={() => setLeftCollapsed(!leftCollapsed)}
          onRightToggle={() => setRightCollapsed(!rightCollapsed)}
        />
        {/* AI Sidebar Overlay */}
        {isAIPanelOpen && (
          <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-xl z-20 overflow-hidden">
            <AIChatSidebar />
          </div>
        )}
      </div>
    </div>
  );
}
