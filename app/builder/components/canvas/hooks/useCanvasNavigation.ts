import { useCallback } from 'react';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';

// Helper to find a file node by its path
const findNodeByPath = (nodes: FileNode[], path: string): FileNode | null => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
};

// Helper to collect all file paths from the tree
const collectFilePaths = (nodes: FileNode[]): string[] => {
  const paths: string[] = [];
  const traverse = (nodes: FileNode[]) => {
    nodes.forEach(node => {
      if (node.type === 'file') {
        paths.push(node.path);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return paths;
};

export function useCanvasNavigation() {
  const { files, setActiveFile, createFile } = useProjectStore();

  const navigateToFile = useCallback((path: string) => {
    const node = findNodeByPath(files, path);
    if (node) {
      setActiveFile(node.id);
      return true;
    }
    return false;
  }, [files, setActiveFile]);

  const findFilesByType = useCallback((type: 'component' | 'page' | 'util') => {
    const allPaths = collectFilePaths(files);
    return allPaths.filter(path => {
      if (type === 'component') return path.includes('/components/');
      if (type === 'page') return path.includes('/pages/') || path.includes('/app/');
      if (type === 'util') return path.includes('/utils/') || path.includes('/lib/');
      return false;
    });
  }, [files]);

  const getNextFile = useCallback((currentPath: string, direction: 'next' | 'prev') => {
    const allPaths = collectFilePaths(files).sort();
    const currentIndex = allPaths.indexOf(currentPath);

    if (currentIndex === -1) return null;

    if (direction === 'next') {
      return allPaths[(currentIndex + 1) % allPaths.length];
    } else {
      return allPaths[(currentIndex - 1 + allPaths.length) % allPaths.length];
    }
  }, [files]);

  return {
    navigateToFile,
    findFilesByType,
    getNextFile
  };
}
