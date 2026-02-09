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

// Export type aliases for convenience
export type DatabaseStack = StackConfig['database'];
export type GitProvider = StackConfig['gitProvider'];
export type FrontendStack = StackConfig['frontend'];
export type BackendStack = StackConfig['backend'];
