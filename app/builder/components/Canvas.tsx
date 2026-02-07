"use client";

import { CanvasProps } from './canvas/types';
import EnhancedCanvasPanel from './canvas/EnhancedCanvasPanel';

export default function Canvas(props: CanvasProps) {
  return <EnhancedCanvasPanel {...props} />;
}
