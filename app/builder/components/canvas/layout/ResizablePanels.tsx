'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  leftSize: initialLeftSize = 18,
  rightSize: initialRightSize = 35,
  minLeftSize = 10,
  minRightSize = 20,
  onLeftToggle,
  onRightToggle,
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftSize);
  const [rightWidth, setRightWidth] = useState(initialRightSize);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle left panel resize
  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  };

  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;

      if (isDraggingLeft) {
        const newLeftWidth = ((e.clientX - containerRect.left) / containerWidth) * 100;
        setLeftWidth(Math.max(minLeftSize, Math.min(50, newLeftWidth)));
      }

      if (isDraggingRight) {
        const newRightWidth = ((containerRect.right - e.clientX) / containerWidth) * 100;
        setRightWidth(Math.max(minRightSize, Math.min(50, newRightWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight, minLeftSize, minRightSize]);

  const centerWidth = 100 - leftWidth - rightWidth;

  return (
    <div ref={containerRef} className="flex h-full w-full">
      {/* Left panel */}
      {left && (
        <div style={{ width: `${leftWidth}%` }} className="relative h-full">
          {left}
          <button
            onClick={onLeftToggle}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center border border-gray-600"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div
            className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
            onMouseDown={handleLeftMouseDown}
          />
        </div>
      )}

      {/* Center panel */}
      <div style={{ width: `${centerWidth}%` }} className="h-full">
        {center}
      </div>

      {/* Right panel */}
      {right && (
        <div style={{ width: `${rightWidth}%` }} className="relative h-full">
          <div
            className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
            onMouseDown={handleRightMouseDown}
          />
          {right}
          <button
            onClick={onRightToggle}
            className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center border border-gray-600"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};
