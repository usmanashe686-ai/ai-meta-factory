"use client";

import { useEffect } from 'react';
import { EnhancedCanvasLayout } from './layout/EnhancedCanvasLayout';
import { configureMonaco } from './editor/MonacoConfig';
import { useProjectStore } from './state/project-store';
import { CanvasProps } from './types';

export default function EnhancedCanvasPanel(props: CanvasProps) {
  const {
    initialFiles = {},
    onFilesChange,
    stack,
    projectName = 'New Project',
    session
  } = props;

  const { 
    setName, 
    setStack, 
    createFile, 
    resetProject
  } = useProjectStore();

  useEffect(() => {
    configureMonaco();
    
    const initializeProject = async () => {
      try {
        if (projectName && projectName !== 'New Project') {
          setName(projectName);
        }
        
        if (stack) {
          setStack(stack);
        }
        
        const currentState = useProjectStore.getState();
        const hasExistingFiles = Object.keys(currentState.files).length > 3;
        
        if (initialFiles && Object.keys(initialFiles).length > 0 && !hasExistingFiles) {
          console.log('Loading initial files:', Object.keys(initialFiles).length);
          
          resetProject();
          
          Object.entries(initialFiles).forEach(([path, content]) => {
            const isCodeFile = /\.(tsx?|jsx?|py|dart)$/.test(path);
            createFile(path, content, isCodeFile);
          });
        }
        
        if (onFilesChange && typeof onFilesChange === 'function') {
          const unsubscribe = useProjectStore.subscribe((state) => {
            const filesForCallback: Record<string, string> = {};
            Object.entries(state.files).forEach(([path, fileData]) => {
              if (!path.includes('.folder-marker')) {
                filesForCallback[path] = fileData.content;
              }
            });
            onFilesChange(filesForCallback);
          });
          
          return unsubscribe;
        }
      } catch (error) {
        console.error('Failed to initialize project:', error);
      }
    };
    
    initializeProject();
    
    return () => {
      // Cleanup
    };
  }, [initialFiles, projectName, stack, onFilesChange, setName, setStack, createFile, resetProject]);

  return (
    <div className="h-screen">
      <EnhancedCanvasLayout />
    </div>
  );
}
