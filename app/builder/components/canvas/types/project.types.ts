// ============================================================================
// AI Meta Factory – Project‑specific Type Definitions
// ============================================================================

import { ProjectType, Framework, ExportFormat, BuildStatus } from './platform.types';

/** A unique identifier for a project (UUID or nanoid) */
export type ProjectId = string;

/** A virtual file in the project */
export interface ProjectFile {
  path: string;
  content: string | Buffer;
  lastModified: Date;
  type: 'file' | 'directory';
  size?: number;
  binary?: boolean;
}

/** Configuration specific to a project */
export interface ProjectConfig {
  version: string; // e.g. "1.0.0"
  main?: string; // entry point file
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  env?: Record<string, string>;
  buildCommand?: string;
  outputDir?: string;
  android?: {
    packageName: string;
    minSdkVersion?: number;
    targetSdkVersion?: number;
    permissions?: string[];
    signingConfig?: {
      storeFile?: string;
      keyAlias?: string;
      storePassword?: string;
      keyPassword?: string;
    };
  };
  ios?: {
    bundleId: string;
    deploymentTarget?: string;
    teamId?: string;
  };
}

/** Core Project model */
export interface Project {
  id: ProjectId;
  name: string;
  slug: string;
  description?: string;
  type: ProjectType;
  framework?: Framework;
  createdAt: Date;
  updatedAt: Date;
  
  /** Virtual filesystem: path → file content or metadata */
  files: Record<string, ProjectFile>;
  
  thumbnail?: string; // URL or data URL
  tags: string[];
  isPublic: boolean;
  isTemplate: boolean;
  forkedFrom?: ProjectId;
  
  config: ProjectConfig;
  
  // Analytics / social
  starCount: number;
  forkCount: number;
  viewCount: number;
  
  // Owner (will be linked to user ID later)
  ownerId?: string;
  teamId?: string;
}

/** A build of a project (APK, EXE, etc.) */
export interface Build {
  id: string;
  projectId: ProjectId;
  buildNumber: number;
  status: BuildStatus;
  format: ExportFormat;
  version?: string;
  artifactUrl?: string;
  logs?: string;
  size?: number; // bytes
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  config?: Record<string, any>; // build‑specific options
}

/** A deployment (Vercel, Netlify, etc.) */
export interface Deployment {
  id: string;
  projectId: ProjectId;
  provider: 'vercel' | 'netlify' | 'github-pages' | 'railway' | 'custom';
  url?: string;
  status: 'deploying' | 'live' | 'failed' | 'cancelled';
  branch?: string;
  environment?: Record<string, string>;
  deployedAt?: Date;
  createdAt: Date;
}

/** AI interaction log */
export interface AIRequest {
  id: string;
  projectId?: ProjectId;
  type: 'generate' | 'explain' | 'fix' | 'optimize' | 'chat';
  model: string;
  prompt: string;
  response?: string;
  inputTokens: number;
  outputTokens?: number;
  latencyMs?: number;
  createdAt: Date;
}

/** Template metadata */
export interface Template {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  framework?: Framework;
  thumbnail?: string;
  author?: string;
  stars: number;
  downloads: number;
  files: Record<string, ProjectFile>;
  readme: string;
  config?: Partial<ProjectConfig>;
}
