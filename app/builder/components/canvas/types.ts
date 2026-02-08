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
}

export type ProjectStore = {
  name: string;
  stack: StackConfig;
  files: Record<string, FileData>;
  activeFile: string | null;
  // ... other properties
};
