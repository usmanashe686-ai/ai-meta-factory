"use client";

import { EnhancedCanvasPanel } from '../components/canvas/EnhancedCanvasPanel';
import { StackConfig } from '../components/canvas/types';

export default function CanvasPage() {
  // These would come from your data fetching/state
  const initialFiles = {};
  const onFilesChange = (files: Record<string, string>) => {
    console.log('Files changed:', Object.keys(files).length);
  };
  
  // Create a proper StackConfig object
  // If you have a 'mode' variable, it should be the frontend value
  // For now, let's create a full StackConfig
  const stack: StackConfig = {
    frontend: 'nextjs', // This would be your 'mode' variable
    backend: 'nodejs',  // Default or from your state
    database: 'supabase', // Default or from your state
    gitProvider: 'github' // Default or from your state
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
