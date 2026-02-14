'use client';

import * as ResizablePrimitives from 'react-resizable-panels';
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
  left,
  center,
  right,
  defaultLeftSize = 20,
  defaultRightSize = 30,
  minLeftSize = 15,
  minRightSize = 20,
}: ResizablePanelsProps) {
  return (
    <ResizablePrimitives.PanelGroup direction="horizontal" className="h-full w-full bg-gray-900">
      <ResizablePrimitives.Panel defaultSize={defaultLeftSize} minSize={minLeftSize} maxSize={40}>
        <div className="h-full overflow-auto bg-gray-800 text-gray-200">{left}</div>
      </ResizablePrimitives.Panel>
      <ResizablePrimitives.PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
      <ResizablePrimitives.Panel defaultSize={100 - defaultLeftSize - defaultRightSize}>
        <div className="h-full overflow-hidden bg-gray-900">{center}</div>
      </ResizablePrimitives.Panel>
      <ResizablePrimitives.PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
      <ResizablePrimitives.Panel defaultSize={defaultRightSize} minSize={minRightSize}>
        <div className="h-full overflow-auto bg-white">{right}</div>
      </ResizablePrimitives.Panel>
    </ResizablePrimitives.PanelGroup>
  );
}
