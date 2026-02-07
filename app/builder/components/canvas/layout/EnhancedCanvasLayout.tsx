'use client';
import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TreeFileExplorer } from '../explorer/TreeFileExplorer';
import { PreviewEngine } from '../preview/PreviewEngine';
import { usePreviewStore } from '../state/preview-store';

export function EnhancedCanvasLayout() {
  const { isPreviewVisible } = usePreviewStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-white">
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={20} minSize={10}>
            <div className="h-full border-r border-gray-800"><TreeFileExplorer /></div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-blue-500" />
          <Panel defaultSize={isPreviewVisible ? 50 : 80} minSize={30}>
            <div className="h-full border-r border-gray-800"><PreviewEngine /></div>
          </Panel>
          {isPreviewVisible && <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-blue-500" />}
        </PanelGroup>
      </div>
    </div>
  );
}
import { ThemeToggle } from '../ui/ThemeToggle';
import { ExportProject } from '../ui/ExportProject';

{/* Inside top toolbar */}
<div className="flex items-center gap-4">
  <ThemeToggle />
  <ExportProject />
</div>
