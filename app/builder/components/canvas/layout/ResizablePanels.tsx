'use client';

import React from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResizablePanelsProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  leftSize?: number;
  rightSize?: number;
  minLeftSize?: number;
  minRightSize?: number;
  onLeftToggle?: () => void;
  onRightToggle?: () => void;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  left,
  center,
  right,
  leftSize = 18,
  rightSize = 35,
  minLeftSize = 10,
  minRightSize = 20,
  onLeftToggle,
  onRightToggle,
}) => {
  return (
    <PanelGroup direction="horizontal" className="h-full">
      {left && (
        <>
          <Panel defaultSize={leftSize} minSize={minLeftSize} collapsible>
            <div className="relative h-full">
              {left}
              <button
                onClick={onLeftToggle}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center border border-gray-600"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-gray-600 transition-colors" />
        </>
      )}
      <Panel>
        {center}
      </Panel>
      {right && (
        <>
          <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-gray-600 transition-colors" />
          <Panel defaultSize={rightSize} minSize={minRightSize} collapsible>
            <div className="relative h-full">
              {right}
              <button
                onClick={onRightToggle}
                className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center border border-gray-600"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </Panel>
        </>
      )}
    </PanelGroup>
  );
};
