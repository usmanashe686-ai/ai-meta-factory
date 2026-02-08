export type FrontendStack = 'nextjs' | 'react' | 'flutter';
export type BackendStack = 'node' | 'python' | 'none';
export type DatabaseType = 'supabase' | 'firebase' | 'mongodb' | 'planetscale' | 'none';
export type GitProviderType = 'github' | 'gitlab' | 'bitbucket';

export interface StackConfig {
  frontend: FrontendStack;
  backend: BackendStack;
  database: DatabaseType;
  gitProvider: GitProviderType;
}
