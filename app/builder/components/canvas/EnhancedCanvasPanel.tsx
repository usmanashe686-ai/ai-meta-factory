"use client";

import { useEffect } from 'react';
import { EnhancedCanvasLayout } from './layout/EnhancedCanvasLayout';
import { configureMonaco } from './editor/MonacoConfig';

export function EnhancedCanvasPanel() {
  useEffect(() => {
    // Configure Monaco Editor
    configureMonaco();
    
    // Load initial project state if needed
    const loadProject = async () => {
      try {
        // You can load a saved project here
        console.log('Canvas loaded');
      } catch (error) {
        console.error('Failed to load canvas:', error);
      }
    };
    
    loadProject();
  }, []);

  return (
    <div className="h-screen">
      <EnhancedCanvasLayout />
    </div>
  );
}
