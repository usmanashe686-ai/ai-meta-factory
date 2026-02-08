"use client";

import { useProjectStore } from '../state/project-store';

export function useFileSystem() {
  const { 
    files, 
    activeFile, 
    createFile, 
    updateFile, 
    removeFile, 
    renameFile, 
    copyFile,
    setActiveFile 
  } = useProjectStore();

  const getFile = (path: string) => {
    return files[path];
  };

  const fileExists = (path: string) => {
    return !!files[path];
  };

  const createNewFile = (path: string, content: string = '', isCodeFile: boolean = false) => {
    createFile(path, content, isCodeFile);
  };

  const updateFileContent = (path: string, content: string) => {
    updateFile(path, content);
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

  const getActiveFile = () => {
    if (!activeFile) return null;
    return getFile(activeFile);
  };

  const getFileExtension = (path: string) => {
    return path.split('.').pop() || '';
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  const getDirectory = (path: string) => {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
  };

  return {
    files,
    activeFile,
    getFile,
    fileExists,
    createNewFile,
    updateFileContent,
    deleteFile,
    moveFile,
    duplicateFile,
    getActiveFile,
    getFileExtension,
    getFileName,
    getDirectory,
    setActiveFile
  };
}
