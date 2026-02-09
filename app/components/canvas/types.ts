export interface StackConfig {
  frontend: 'nextjs' | 'react' | 'flutter';
  backend: 'node' | 'python' | 'none';
  database: 'supabase' | 'firebase' | 'mongodb' | 'planetscale' | 'none';
  gitProvider: 'github' | 'gitlab' | 'bitbucket';
}

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectExport {
  name: string;
  files: Record<string, string>;
  stack: StackConfig;
  metadata: {
    createdAt: Date;
    exportedAt: Date;
  };
}

// Export the union types for use in other files
export type DatabaseStack = 'supabase' | 'firebase' | 'mongodb' | 'planetscale' | 'none';
export type GitProvider = 'github' | 'gitlab' | 'bitbucket';
export type FrontendStack = 'nextjs' | 'react' | 'flutter';
export type BackendStack = 'node' | 'python' | 'none';
