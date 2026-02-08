"use client";

import { useEffect } from 'react';
import { EnhancedCanvasLayout } from './layout/EnhancedCanvasLayout';
import { useProjectStore } from './state/project-store';

// Simple types to avoid external dependencies
type FrontendStack = 'react' | 'nextjs' | 'vue' | 'flutter';
type BackendStack = 'node' | 'python' | 'go' | 'none';
type DatabaseStack = 'postgresql' | 'mongodb' | 'sqlite' | 'none';
type DeploymentStack = 'vercel' | 'netlify' | 'aws' | 'railway' | 'none';

type StackConfig = {
  frontend: FrontendStack;
  backend: BackendStack;
  database: DatabaseStack;
  deployment: DeploymentStack;
};

interface CanvasProps {
  initialFiles?: Record<string, string>;
  onFilesChange?: (files: Record<string, string>) => void;
  stack?: Partial<StackConfig>;
  projectName?: string;
  session?: any;
}

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
    const initializeProject = async () => {
      try {
        if (projectName && projectName !== 'New Project') {
          setName(projectName);
        }
        
        if (stack) {
          const completeStack: StackConfig = {
            frontend: (stack.frontend as FrontendStack) || 'react',
            backend: (stack.backend as BackendStack) || 'none',
            database: (stack.database as DatabaseStack) || 'none',
            deployment: (stack.deployment as DeploymentStack) || 'vercel'
          };
          setStack(completeStack);
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
          const unsubscribe = useProjectStore.subscribe((state: any) => {
            const filesForCallback: Record<string, string> = {};
            Object.entries(state.files).forEach(([path, fileData]: [string, any]) => {
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
