// ============================================================================
// AI Meta Factory – File System Utilities
// Virtual filesystem helpers, path manipulation, file operations.
// ============================================================================

import { ProjectFile } from '../types/project.types';

/**
 * Normalize file path (remove leading/trailing slashes, ensure consistent separator)
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
}

/**
 * Get directory name from a file path
 */
export function dirname(path: string): string {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? '' : normalized.substring(0, lastSlash);
}

/**
 * Get base name (file name) from a path
 */
export function basename(path: string): string {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? normalized : normalized.substring(lastSlash + 1);
}

/**
 * Get file extension (including dot)
 */
export function extname(path: string): string {
  const base = basename(path);
  const lastDot = base.lastIndexOf('.');
  return lastDot === -1 ? '' : base.substring(lastDot);
}

/**
 * Join multiple path segments
 */
export function joinPaths(...segments: string[]): string {
  return segments.map(normalizePath).join('/').replace(/\/+/g, '/');
}

/**
 * Build a file tree from a flat record of files
 * Returns a nested structure for tree views
 */
export function buildFileTree(files: Record<string, ProjectFile>): FileTreeNode[] {
  const root: Record<string, any> = {};
  
  Object.keys(files).forEach((path) => {
    const normalized = normalizePath(path);
    const parts = normalized.split('/');
    let current = root;
    
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1 && files[path].type === 'file';
      if (!current[part]) {
        current[part] = isFile
          ? { ...files[path], name: part, children: null }
          : { name: part, type: 'directory', children: {} };
      }
      current = current[part].children || current[part];
    });
  });
  
  return Object.values(root).map((item) => {
    if (item.children) {
      item.children = Object.values(item.children);
    }
    return item;
  });
}

export interface FileTreeNode {
  name: string;
  path?: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  content?: string | Buffer;
  lastModified?: Date;
}

/**
 * Check if a path exists in the project files
 */
export function fileExists(files: Record<string, ProjectFile>, path: string): boolean {
  return !!files[normalizePath(path)];
}

/**
 * Get all files matching a glob pattern (simple implementation)
 */
export function glob(files: Record<string, ProjectFile>, pattern: string): string[] {
  const isMatch = (path: string): boolean => {
    if (pattern === '*') return true;
    if (pattern.endsWith('/*')) {
      const dir = pattern.slice(0, -2);
      return path.startsWith(dir) && !path.slice(dir.length + 1).includes('/');
    }
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  };
  
  return Object.keys(files).filter(isMatch);
}

/**
 * Estimate project size (sum of file sizes)
 */
export function estimateProjectSize(files: Record<string, ProjectFile>): number {
  return Object.values(files).reduce((total, file) => {
    if (file.type === 'file' && file.size) {
      return total + file.size;
    }
    return total;
  }, 0);
}

/**
 * Create a new file object
 */
export function createFile(
  path: string,
  content: string | Buffer = '',
  binary = false
): ProjectFile {
  return {
    path: normalizePath(path),
    content,
    lastModified: new Date(),
    type: 'file',
    size: content.length,
    binary,
  };
}

/**
 * Create a new directory object
 */
export function createDirectory(path: string): ProjectFile {
  return {
    path: normalizePath(path),
    content: '',
    lastModified: new Date(),
    type: 'directory',
  };
}
