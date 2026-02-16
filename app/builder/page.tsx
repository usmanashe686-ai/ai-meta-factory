"use client";

import dynamic from 'next/dynamic';

// Dynamically import the heavy canvas component
const EnhancedCanvasPanel = dynamic(
  () => import('./components/canvas/EnhancedCanvasPanel').then(mod => mod.EnhancedCanvasPanel),
  {
    ssr: false,
    loading: () => <div className="h-screen bg-gray-900 animate-pulse" />,
  }
);

export default function BuilderPage() {
  return (
    <div className="h-screen bg-gray-900">
      <EnhancedCanvasPanel />
    </div>
  );
}
