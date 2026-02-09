export interface StackConfig {
  frontend: 'nextjs' | 'react' | 'flutter';
  backend: 'nodejs' | 'python' | 'none';
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
