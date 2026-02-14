"use client";

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

export function useFileSystem() {
  const {
    files,
    activeFile: activeFilePath,
    createFile,
    updateFileContent,
    removeFile,
    renameFile,
    copyFile,
    setActiveFile,
  } = useProjectStore();

  const getFile = (path: string): FileNode | undefined => {
    const node = findNodeByPath(files, path);
    return node ?? undefined;
  };

  const fileExists = (path: string): boolean => {
    return findNodeByPath(files, path) !== null;
  };

  const createNewFile = (path: string, content: string = '', isFolder: boolean = false) => {
    createFile(path, content, isFolder);
  };

  const updateFileContentHandler = (path: string, content: string) => {
    updateFileContent(path, content);
  };

  const deleteFile = (path: string) => {
    removeFile(path);
  };

  const moveFile = (oldPath: string, newPath: string) => {
    renameFile(oldPath, newPath);
  };

  const duplicateFile = (path: string) => {
    copyFile(path);
  };

  const getActiveFile = (): FileNode | null => {
    if (!activeFilePath) return null;
    return getFile(activeFilePath) || null;
  };

  const getFileExtension = (path: string): string => {
    return path.split('.').pop() || '';
  };

  const getFileName = (path: string): string => {
    return path.split('/').pop() || path;
  };

  const getDirectory = (path: string): string => {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
  };

  return {
    files,
    activeFile: activeFilePath,
    getFile,
    fileExists,
    createNewFile,
    updateFileContent: updateFileContentHandler,
    deleteFile,
    moveFile,
    duplicateFile,
    getActiveFile,
    getFileExtension,
    getFileName,
    getDirectory,
    setActiveFile,
  };
}
