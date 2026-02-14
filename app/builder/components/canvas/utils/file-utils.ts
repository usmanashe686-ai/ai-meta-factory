// ============================================================================
// AI Meta Factory – File System Utilities
// Virtual filesystem helpers, path manipulation, file operations.
// ============================================================================

import { FileNode } from '../types/project.types';

// Helper to flatten tree into a record keyed by path
function flattenTreeToRecord(nodes: FileNode[], prefix = ''): Record<string, FileNode> {
  let result: Record<string, FileNode> = {};
  nodes.forEach(node => {
    const path = prefix ? `${prefix}/${node.name}` : node.name;
    result[path] = node;
    if (node.children) {
      result = { ...result, ...flattenTreeToRecord(node.children, path) };
    }
  });
  return result;
}

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
export function buildFileTree(files: Record<string, FileNode>): FileTreeNode[] {
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
 * Check if a path exists in the project files (accepts tree nodes)
 */
export function fileExists(nodes: FileNode[], path: string): boolean {
  const flat = flattenTreeToRecord(nodes);
  return !!flat[normalizePath(path)];
}

/**
 * Get all files matching a glob pattern (simple implementation) – works with tree
 */
export function glob(nodes: FileNode[], pattern: string): string[] {
  const flat = flattenTreeToRecord(nodes);
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
  return Object.keys(flat).filter(isMatch);
}

/**
 * Estimate project size (sum of file sizes) – works with tree
 */
export function estimateProjectSize(nodes: FileNode[]): number {
  const flat = flattenTreeToRecord(nodes);
  return Object.values(flat).reduce((total, file) => {
    if (file.type === 'file' && file.content) {
      return total + file.content.length;
    }
    return total;
  }, 0);
}

/**
 * Create a new file object (returns a FileNode)
 */
export function createFile(
  path: string,
  content: string | Buffer = '',
  binary = false
): FileNode {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: basename(normalizePath(path)),
    path: normalizePath(path),
    type: 'file',
    content: content.toString(),
  };
}

/**
 * Create a new directory object (returns a FileNode)
 */
export function createDirectory(path: string): FileNode {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: basename(normalizePath(path)),
    path: normalizePath(path),
    type: 'folder',
    children: [],
  };
}
