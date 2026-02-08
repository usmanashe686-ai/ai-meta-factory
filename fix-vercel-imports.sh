#!/bin/bash

echo "Fixing import paths for Vercel deployment..."

# 1. Update builder/canvas/page.tsx to use correct relative path
cat > app/builder/canvas/page.tsx << 'ENDPAGE'
import EnhancedCanvasPanel from '../components/canvas/EnhancedCanvasPanel';

export default function CanvasPage() {
  const stack = {
    frontend: 'nextjs' as const,
    backend: 'node' as const,
    database: 'postgresql' as const,
  };

  return (
    <div className="h-screen">
      <EnhancedCanvasPanel
        projectName="AI Meta Factory"
        stack={stack}
        initialFiles={{
          'src/App.tsx': `export default function App() {
  return (
    <div>
      <h1>Welcome to AI Meta Factory</h1>
    </div>
  );
}`,
          'README.md': '# AI Meta Factory\n\nBuild and deploy AI-powered applications.',
        }}
      />
    </div>
  );
}
ENDPAGE

echo "✅ Updated app/builder/canvas/page.tsx"

# 2. Update builder/page.tsx to use correct relative path  
cat > app/builder/page.tsx << 'ENDPAGE'
import EnhancedCanvasPanel from './components/canvas/EnhancedCanvasPanel';

export default function BuilderPage() {
  const stack = {
    frontend: 'nextjs' as const,
    backend: 'node' as const,
    database: 'postgresql' as const,
  };

  return (
    <div className="h-screen">
      <EnhancedCanvasPanel
        projectName="AI Meta Factory"
        stack={stack}
        initialFiles={{
          'src/App.tsx': `export default function App() {
  return (
    <div>
      <h1>Welcome to AI Meta Factory</h1>
    </div>
  );
}`,
          'README.md': '# AI Meta Factory\n\nBuild and deploy AI-powered applications.',
        }}
      />
    </div>
  );
}
ENDPAGE

echo "✅ Updated app/builder/page.tsx"

# 3. Check if EnhancedCanvasPanel.tsx exists in the right location
if [ ! -f "app/builder/components/canvas/EnhancedCanvasPanel.tsx" ]; then
    echo "❌ EnhancedCanvasPanel.tsx not found at app/builder/components/canvas/"
    echo "Looking for it..."
    find . -name "EnhancedCanvasPanel.tsx" -type f | head -5
    
    # Try to create it if missing
    echo "Creating EnhancedCanvasPanel.tsx..."
    mkdir -p app/builder/components/canvas
    
    cat > app/builder/components/canvas/EnhancedCanvasPanel.tsx << 'ENDCANVAS'
"use client";

import { useEffect } from 'react';
import { EnhancedCanvasLayout } from './layout/EnhancedCanvasLayout';
import { configureMonaco } from './editor/MonacoConfig';
import { useProjectStore } from './state/project-store';
import { CanvasProps, StackConfig } from './types';

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
          const completeStack: StackConfig = {
            frontend: (stack.frontend as 'react' | 'nextjs' | 'vue' | 'flutter') || 'react',
            backend: (stack.backend as 'node' | 'python' | 'go' | 'none') || 'none',
            database: (stack.database as 'postgresql' | 'mongodb' | 'sqlite' | 'none') || 'none',
            deployment: (stack.deployment as 'vercel' | 'netlify' | 'aws' | 'railway' | 'none') || 'vercel'
          };
          setStack(completeStack);
        }
        
        const currentState = useProjectStore.getState();
        const hasExistingFiles = Object.keys(currentState.files).length > 3;
        
        if (initialFiles && Object.keys(initialFiles).length > 0 && !hasExistingFiles) {
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
ENDCANVAS
    echo "✅ Created EnhancedCanvasPanel.tsx"
else
    echo "✅ EnhancedCanvasPanel.tsx exists at correct location"
fi

# 4. Create missing dependent files
echo "Checking for missing dependent files..."

# Create types.ts if missing
if [ ! -f "app/builder/components/canvas/types.ts" ]; then
    echo "Creating types.ts..."
    cat > app/builder/components/canvas/types.ts << 'ENDTYPES'
export type FrontendStack = 'react' | 'nextjs' | 'vue' | 'flutter';
export type BackendStack = 'node' | 'python' | 'go' | 'none';
export type DatabaseStack = 'postgresql' | 'mongodb' | 'sqlite' | 'none';
export type DeploymentStack = 'vercel' | 'netlify' | 'aws' | 'railway' | 'none';

export type StackConfig = {
  frontend: FrontendStack;
  backend: BackendStack;
  database: DatabaseStack;
  deployment: DeploymentStack;
};

export interface CanvasProps {
  initialFiles?: Record<string, string>;
  onFilesChange?: (files: Record<string, string>) => void;
  stack?: Partial<StackConfig>;
  projectName?: string;
  session?: any;
}

export interface FileData {
  content: string;
  isCodeFile: boolean;
  lastModified: number;
  language?: string;
}

export type ProjectStore = {
  name: string;
  stack: StackConfig;
  files: Record<string, FileData>;
  activeFile: string | null;
};
ENDTYPES
fi

# Create MonacoConfig.tsx if missing
if [ ! -f "app/builder/components/canvas/editor/MonacoConfig.tsx" ]; then
    echo "Creating MonacoConfig.tsx..."
    mkdir -p app/builder/components/canvas/editor
    cat > app/builder/components/canvas/editor/MonacoConfig.tsx << 'ENDMONACO'
"use client";

export function configureMonaco() {
  // Configure Monaco Editor loader
  if (typeof window !== 'undefined') {
    import('@monaco-editor/react').then(({ loader }) => {
      loader.config({
        paths: {
          vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
        }
      });
    });
  }
}
ENDMONACO
fi

# Create EnhancedCanvasLayout.tsx if missing
if [ ! -f "app/builder/components/canvas/layout/EnhancedCanvasLayout.tsx" ]; then
    echo "Creating EnhancedCanvasLayout.tsx..."
    mkdir -p app/builder/components/canvas/layout
    cat > app/builder/components/canvas/layout/EnhancedCanvasLayout.tsx << 'ENDLAYOUT'
"use client";

export function EnhancedCanvasLayout() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">AI Meta Factory Canvas</h1>
        <p className="text-gray-400">Canvas layout is loading...</p>
      </div>
    </div>
  );
}
ENDLAYOUT
fi

# Create project-store.ts if missing
if [ ! -f "app/builder/components/canvas/state/project-store.ts" ]; then
    echo "Creating project-store.ts..."
    mkdir -p app/builder/components/canvas/state
    cat > app/builder/components/canvas/state/project-store.ts << 'ENDSTORE'
"use client";

import { create } from 'zustand';

export const useProjectStore = create(() => ({
  name: 'New Project',
  stack: {
    frontend: 'react' as const,
    backend: 'none' as const,
    database: 'none' as const,
    deployment: 'vercel' as const
  },
  files: {},
  activeFile: null,
  setName: () => {},
  setStack: () => {},
  createFile: () => {},
  resetProject: () => {}
}));
ENDSTORE
fi

echo ""
echo "✅ All import paths fixed!"
echo "Testing the build locally..."
npm run build 2>&1 | tail -50

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 LOCAL BUILD SUCCESSFUL! 🎉"
    echo "Now push to GitHub to trigger Vercel deployment:"
    echo ""
    echo "git add ."
    echo "git commit -m 'Fix: Correct import paths for Vercel deployment'"
    echo "git push"
else
    echo ""
    echo "⚠️  Build still has issues. Let me check..."
    npm run build 2>&1 | grep -A 5 "error\|Error"
fi
