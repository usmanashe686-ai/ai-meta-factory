"use client";

import { Suspense, lazy } from 'react';

const EnhancedCanvasLayout = lazy(() =>
  import('./components/canvas/layout/EnhancedCanvasLayout').then((mod) => ({
    default: mod.EnhancedCanvasLayout,
  }))
);

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0d1117] text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-gray-400">Initializing Factory...</p>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <main className="h-screen w-full overflow-hidden bg-[#0d1117]">
      <Suspense fallback={<LoadingFallback />}>
        <EnhancedCanvasLayout />
      </Suspense>
    </main>
  );
}
