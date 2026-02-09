"use client";

import React from "react";

export const ResizablePanelGroup = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`flex w-full h-full ${className}`}>{children}</div>;
};

export const ResizablePanel = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`flex-1 ${className}`}>{children}</div>;
};

export const ResizableHandle = () => {
  return <div className="w-[2px] bg-gray-700" />;
};
