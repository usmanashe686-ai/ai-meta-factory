"use client";

import React from "react";

// Minimal resizable components for Canvas
export const ResizableHandle = () => <div className="resizable-handle" />;

export const ResizablePanel = ({ children }: { children: React.ReactNode }) => (
  <div className="resizable-panel">{children}</div>
);

export const ResizablePanelGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="resizable-panel-group">{children}</div>
);
