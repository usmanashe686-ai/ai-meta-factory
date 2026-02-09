"use client";

import EnhancedCanvasPanel from './canvas/EnhancedCanvasPanel';
import { StackConfig } from './canvas/types';

interface CanvasProps {
  initialFiles: Record<string, string>;
  onFilesChange: (files: Record<string, string>) => void;
  stack: StackConfig;
  projectName: string;
  session: any;
}

export default function Canvas(props: CanvasProps) {
  return <EnhancedCanvasPanel {...props} />;
}
