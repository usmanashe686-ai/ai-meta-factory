"use client";

import React from "react";

// Placeholder Resizable components to fix build
export const ResizableHandle = () => <div className="resizable-handle" />;

export const ResizablePanel = ({ children }: { children: React.ReactNode }) => (
  <div className="resizable-panel">{children}</div>
);

export const ResizablePanelGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="resizable-panel-group">{children}</div>
);
