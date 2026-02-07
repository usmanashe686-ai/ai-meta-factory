"use client";

import { useEffect } from 'react';
import { EnhancedCanvasLayout } from './layout/EnhancedCanvasLayout';
import { configureMonaco } from './editor/MonacoConfig';
import { useProjectStore } from './state/project-store';
import { CanvasProps } from './types';

export function EnhancedCanvasPanel(props: CanvasProps) {
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
    // Configure Monaco Editor
    configureMonaco();
    
    // Initialize project state if props are provided
    const initializeProject = async () => {
      try {
        // Set project name if provided
        if (projectName && projectName !== 'New Project') {
          setName(projectName);
        }
        
        // Set stack configuration if provided
        if (stack) {
          setStack(stack);
        }
        
        // Get current state using Zustand's getState
        const currentState = useProjectStore.getState();
        const hasExistingFiles = Object.keys(currentState.files).length > 3; // More than default files
        
        // Load initial files if provided and store is empty
        if (initialFiles && Object.keys(initialFiles).length > 0 && !hasExistingFiles) {
          console.log('Loading initial files:', Object.keys(initialFiles).length);
          
          // Clear existing files first
          resetProject();
          
          // Load initial files (AI-generated ones)
          Object.entries(initialFiles).forEach(([path, content]) => {
            // Check if it's a TypeScript/JS file to set aiGenerated flag
            const isCodeFile = /\.(tsx?|jsx?|py|dart)$/.test(path);
            createFile(path, content, isCodeFile); // AI-generated code files
          });
        }
        
        // Call onFilesChange callback if provided
        if (onFilesChange && typeof onFilesChange === 'function') {
          // Set up listener for file changes
          const unsubscribe = useProjectStore.subscribe((state) => {
            // Convert FileData format to simple string format for callback
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
    
    // Cleanup function if needed
    return () => {
      // Any cleanup needed
    };
  }, [initialFiles, projectName, stack, onFilesChange]); // Dependencies

  return (
    <div className="h-screen">
      <EnhancedCanvasLayout />
    </div>
  );
}
