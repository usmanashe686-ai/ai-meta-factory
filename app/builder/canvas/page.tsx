"use client";

import { useEffect } from 'react';
import { Canvas } from '../components/Canvas';
import { configureMonaco } from '../components/canvas/editor/MonacoConfig';

export default function CanvasPage() {
  useEffect(() => {
    configureMonaco();
  }, []);
  
  return (
    <div className="h-screen">
      <Canvas />
    </div>
  );
}
