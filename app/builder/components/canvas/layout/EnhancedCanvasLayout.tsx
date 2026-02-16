'use client';

import { useEffect } from 'react';
import { ResizablePanels } from './ResizablePanels';
import { FileExplorer } from '../explorer/FileExplorer';
import { CodeEditor } from '../editor/CodeEditor';
import { UniversalPreview } from '../preview/UniversalPreview';
import CanvasHeader from './CanvasHeader';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';

export function EnhancedCanvasLayout() {
  const { project, createBlankProject } = useProjectStore();
  const { platform } = usePlatformStore();

  // Auto-create a blank project if none exists
  useEffect(() => {
    if (!project) {
      createBlankProject();
    }
  }, [project, createBlankProject]);

  if (!project) {
    // This will only show briefly while the effect runs
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Creating blank workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <CanvasHeader />
      <div className="flex-1 overflow-hidden">
        <ResizablePanels
          left={<FileExplorer />}
          center={<CodeEditor />}
          right={<UniversalPreview />}
          defaultLeftSize={18}
          defaultRightSize={35}
        />
      </div>
    </div>
  );
}
