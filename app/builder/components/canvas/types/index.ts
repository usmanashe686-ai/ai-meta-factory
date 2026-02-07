// Type definitions for AI Meta Factory Canvas

// Stack Configuration
export type FrontendStack = 'nextjs' | 'react' | 'flutter';
export type BackendStack = 'nodejs' | 'python' | 'none';
export type DatabaseStack = 'supabase' | 'firebase' | 'mongodb' | 'planetscale' | 'none';
export type GitProvider = 'github' | 'gitlab' | 'bitbucket' | 'none';

export interface StackConfig {
  frontend: FrontendStack;
  backend: BackendStack;
  database: DatabaseStack;
  gitProvider: GitProvider;
}

// File System
export interface FileItem {
  content: string;
  language: string;
  lastModified: string;
  aiGenerated: boolean;
  aiContext?: {
    prompt: string;
    timestamp: string;
  };
}

// Project State
export interface ProjectData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  stack: StackConfig;
  files: Record<string, FileItem>;
  activeFile: string | null;
}

// Canvas Props
export interface CanvasProps {
  initialFiles?: Record<string, string>;
  onFilesChange?: (files: Record<string, string>) => void;
  stack?: Partial<StackConfig>; // Made partial for flexibility
  projectName?: string;
  session?: any; // Replace with your actual Session type
}

// AI Context
export interface AIContext {
  generationPrompt: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  suggestions: Array<{
    type: 'code' | 'fix' | 'optimize' | 'explain';
    title: string;
    description: string;
    action: string;
  }>;
}

// Preview State
export interface PreviewState {
  url: string | null;
  status: 'idle' | 'building' | 'running' | 'error';
  logs: string[];
}

// Export State
export interface ExportState {
  status: 'idle' | 'exporting' | 'uploading' | 'complete';
  url: string | null;
  size: number;
}

// Helper function to create a full StackConfig from partial
export function createStackConfig(partial?: Partial<StackConfig>): StackConfig {
  return {
    frontend: partial?.frontend || 'nextjs',
    backend: partial?.backend || 'nodejs',
    database: partial?.database || 'supabase',
    gitProvider: partial?.gitProvider || 'github'
  };
}
