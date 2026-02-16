'use client';

import { useEffect, useState } from 'react';
import { ResizablePanels } from './ResizablePanels';
import { FileExplorer } from '../explorer/FileExplorer';
import { CodeEditor } from '../editor/CodeEditor';
import { UniversalPreview } from '../preview/UniversalPreview';
import CanvasHeader from './CanvasHeader';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function EnhancedCanvasLayout() {
  const { project, createBlankProject } = useProjectStore();
  const { platform } = usePlatformStore();
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
    const [mobileTab, setMobileTab] = useState<'explorer' | 'editor' | 'preview'>('editor');
    return (
      <div className="flex h-screen flex-col bg-gray-900">
        <CanvasHeader />
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
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'explorer' && <FileExplorer />}
          {mobileTab === 'editor' && <CodeEditor />}
          {mobileTab === 'preview' && <UniversalPreview />}
        </div>
      </div>
    );
  }

  // Desktop layout with resizable panels and collapse buttons
  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <CanvasHeader />
      <div className="flex-1 overflow-hidden">
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
      </div>
    </div>
  );
}
