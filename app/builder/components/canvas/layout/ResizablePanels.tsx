'use client';

import { useEffect, useRef } from 'react';
import Split from 'react-split';
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
  const splitRef = useRef<any>(null);

  useEffect(() => {
    if (splitRef.current) {
      splitRef.current.split.setSizes([defaultLeftSize, 100 - defaultLeftSize - defaultRightSize, defaultRightSize]);
    }
  }, [defaultLeftSize, defaultRightSize]);

  return (
    <Split
      ref={splitRef}
      sizes={[defaultLeftSize, 100 - defaultLeftSize - defaultRightSize, defaultRightSize]}
      minSize={[minLeftSize, 30, minRightSize]}
      gutterSize={8}
      gutterStyle={() => ({ background: '#4a5568', cursor: 'col-resize' })}
      direction="horizontal"
      className="h-full w-full flex"
    >
      <div className="h-full overflow-auto bg-gray-800 text-gray-200">{left}</div>
      <div className="h-full overflow-hidden bg-gray-900">{center}</div>
      <div className="h-full overflow-auto bg-white">{right}</div>
    </Split>
  );
}
