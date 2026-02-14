'use client';

import { useState } from 'react';
import { ResizablePanels } from './ResizablePanels';
import { FileExplorer } from '../explorer/FileExplorer';
import { CodeEditor } from '../editor/CodeEditor';
import { UniversalPreview } from '../preview/UniversalPreview';
import CanvasHeader from './CanvasHeader';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';

export function EnhancedCanvasLayout() {
  const { currentProject } = useProjectStore();
  // @ts-ignore
  const { selectedPlatform = 'web' } = usePlatformStore();
  const [activeFile, setActiveFile] = useState('/index.tsx');

  if (!currentProject) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Select or create a project to start building</p>
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
