"use client";

import EnhancedCanvasPanel from './components/canvas/EnhancedCanvasPanel';
import { StackConfig } from './components/canvas/types';

export default function CanvasPage() {
  const initialFiles: Record<string, string> = {};

  const onFilesChange = (files: Record<string, string>) => {
    console.log('Files changed:', Object.keys(files).length);
  };

  const stack: StackConfig = {
    frontend: 'nextjs',
    backend: 'nodejs',
    database: 'supabase',
    gitProvider: 'github'
  };

  const projectName = 'My AI Generated Project';
  const session = null;

  return (
    <EnhancedCanvasPanel
      initialFiles={initialFiles}
      onFilesChange={onFilesChange}
      stack={stack}
      projectName={projectName}
      session={session}
    />
  );
}
