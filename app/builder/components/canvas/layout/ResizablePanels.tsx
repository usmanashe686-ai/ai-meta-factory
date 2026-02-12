'use client';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ReactNode } from 'react';
interface ResizablePanelsProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  defaultLeftSize?: number;
  defaultRightSize?: number;
  minLeftSize?: number;
  minRightSize?: number;
}
export function ResizablePanels({
  left, center, right,
  defaultLeftSize = 20,
  defaultRightSize = 30,
  minLeftSize = 15,
  minRightSize = 20,
}: ResizablePanelsProps) {
  return (
    <PanelGroup direction="horizontal" className="h-full w-full bg-gray-900">
      <Panel defaultSize={defaultLeftSize} minSize={minLeftSize} maxSize={40}>
        <div className="h-full overflow-auto bg-gray-800 text-gray-200">{left}</div>
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
      <Panel defaultSize={100 - defaultLeftSize - defaultRightSize}>
        <div className="h-full overflow-hidden bg-gray-900">{center}</div>
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
      <Panel defaultSize={defaultRightSize} minSize={minRightSize}>
        <div className="h-full overflow-auto bg-white">{right}</div>
      </Panel>
    </PanelGroup>
  );
}
