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
    setActiveFile,
    getFileTree,
    searchFiles
  } = useProjectStore();

  const createNewFile = (path: string, content?: string, aiGenerated: boolean = false) => {
    createFile(path, content || '', aiGenerated);
  };

  const updateExistingFile = (path: string, content: string) => {
    updateFile(path, content);
  };

  const deleteExistingFile = (path: string) => {
    removeFile(path);
  };

  const renameExistingFile = (oldPath: string, newPath: string) => {
    renameFile(oldPath, newPath);
  };

  const duplicateExistingFile = (path: string) => {
    const file = files[path];
    if (!file) return;

    const extension = path.split('.').pop();
    const baseName = path.replace(`.${extension}`, '');
    let newPath = '';
    let counter = 1;

    do {
      newPath = `${baseName}-copy${counter > 1 ? counter : ''}.${extension}`;
      counter++;
    } while (files[newPath]);

    // Use createFile with aiGenerated flag from original file
    createFile(newPath, file.content, file.aiGenerated);
  };

  const createNewFolder = (folderName: string, parentPath: string = '') => {
    const folderPath = parentPath 
      ? `${parentPath}/${folderName}/.folder-marker`
      : `${folderName}/.folder-marker`;
    
    createFile(folderPath, '', false);
  };

  const getFileContent = (path: string): string => {
    return files[path]?.content || '';
  };

  const getFileMetadata = (path: string) => {
    return files[path] || null;
  };

  const findFilesByExtension = (extension: string) => {
    return Object.keys(files).filter(path => 
      path.endsWith(`.${extension}`) && !path.includes('.folder-marker')
    );
  };

  const findFilesByContent = (searchText: string) => {
    return Object.entries(files)
      .filter(([path, file]) => 
        !path.includes('.folder-marker') && 
        file.content.toLowerCase().includes(searchText.toLowerCase())
      )
      .map(([path]) => path);
  };

  const moveFile = (oldPath: string, newPath: string) => {
    const file = files[oldPath];
    if (!file) return false;

    // Create at new path
    createFile(newPath, file.content, file.aiGenerated);
    
    // Remove from old path
    removeFile(oldPath);
    
    return true;
  };

  const moveFolder = (oldPath: string, newPath: string) => {
    const folderPath = oldPath.endsWith('/') ? oldPath : oldPath + '/';
    const newFolderPath = newPath.endsWith('/') ? newPath : newPath + '/';
    
    // Find all files in the old folder
    const filesInFolder = Object.keys(files).filter(path => 
      path.startsWith(folderPath) && !path.includes('.folder-marker')
    );
    
    // Move each file
    filesInFolder.forEach(filePath => {
      const newFilePath = filePath.replace(folderPath, newFolderPath);
      const file = files[filePath];
      
      if (file) {
        createFile(newFilePath, file.content, file.aiGenerated);
        removeFile(filePath);
      }
    });
    
    // Move folder marker if exists
    const folderMarkerPath = folderPath + '.folder-marker';
    if (files[folderMarkerPath]) {
      const newMarkerPath = newFolderPath + '.folder-marker';
      createFile(newMarkerPath, '', false);
      removeFile(folderMarkerPath);
    }
  };

  const countFiles = () => {
    return Object.keys(files).filter(path => !path.includes('.folder-marker')).length;
  };

  const countLines = () => {
    return Object.values(files).reduce((total, file) => {
      if (file.content) {
        return total + file.content.split('\n').length;
      }
      return total;
    }, 0);
  };

  const getProjectStats = () => {
    const fileCount = countFiles();
    const lineCount = countLines();
    const languages: Record<string, number> = {};
    
    Object.values(files).forEach(file => {
      if (file.language) {
        languages[file.language] = (languages[file.language] || 0) + 1;
      }
    });
    
    const aiGeneratedCount = Object.values(files).filter(file => file.aiGenerated).length;
    
    return {
      fileCount,
      lineCount,
      languages,
      aiGeneratedCount,
      aiGeneratedPercentage: fileCount > 0 ? Math.round((aiGeneratedCount / fileCount) * 100) : 0
    };
  };

  return {
    // State
    files,
    activeFile,
    
    // Actions
    createNewFile,
    updateExistingFile,
    deleteExistingFile,
    renameExistingFile,
    duplicateExistingFile,
    createNewFolder,
    moveFile,
    moveFolder,
    setActiveFile,
    
    // Queries
    getFileContent,
    getFileMetadata,
    findFilesByExtension,
    findFilesByContent,
    getFileTree,
    searchFiles,
    
    // Statistics
    countFiles,
    countLines,
    getProjectStats
  };
}
