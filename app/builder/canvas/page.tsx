"use client";

import EnhancedCanvasPanel from '../components/canvas/EnhancedCanvasPanel';
import { StackConfig } from '../components/canvas/types';

export default function CanvasPage() {
  // These would come from your data fetching/state
  const initialFiles = {};
  const onFilesChange = (files: Record<string, string>) => {
    console.log('Files changed:', Object.keys(files).length);
  };
  
  // Create a proper StackConfig object
  const stack: StackConfig = {
    frontend: 'nextjs',
    backend: 'nodejs',
    database: 'supabase',
    gitProvider: 'github'
  };
  
  const projectName = 'My AI Generated Project';
  const session = null; // You would get this from your auth provider

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
