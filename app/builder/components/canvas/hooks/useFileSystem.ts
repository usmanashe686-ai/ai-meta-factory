import { useCallback } from 'react';
import { useProjectStore } from '../state/project-store';

export function useFileSystem() {
  const { files, createFile, updateFile, deleteFile, setActiveFile } = useProjectStore();
  
  const renameFile = useCallback((oldPath: string, newPath: string) => {
    const file = files[oldPath];
    if (!file) return false;
    
    // Delete old file
    deleteFile(oldPath);
    
    // Create new file with same content
    createFile(newPath, file.content, file.aiGenerated);
    
    return true;
  }, [files, deleteFile, createFile]);
  
  const duplicateFile = useCallback((path: string) => {
    const file = files[path];
    if (!file) return false;
    
    const extension = path.split('.').pop();
    const baseName = path.substring(0, path.lastIndexOf('.'));
    let newPath = `${baseName}_copy.${extension}`;
    
    // Ensure unique name
    let counter = 1;
    while (files[newPath]) {
      newPath = `${baseName}_copy${counter}.${extension}`;
      counter++;
    }
    
    createFile(newPath, file.content, file.aiGenerated);
    return true;
  }, [files, createFile]);
  
  const createFolder = useCallback((path: string) => {
    // Create an index file in the folder
    const indexPath = `${path}/index.ts`;
    if (!files[indexPath]) {
      createFile(indexPath, `// ${path} folder\n\nexport {};\n`);
    }
    return true;
  }, [createFile, files]);
  
  const getFileInfo = useCallback((path: string) => {
    const file = files[path];
    if (!file) return null;
    
    const size = new Blob([file.content]).size;
    const lines = file.content.split('\n').length;
    
    return {
      path,
      size,
      lines,
      lastModified: file.lastModified,
      language: file.language,
      aiGenerated: file.aiGenerated
    };
  }, [files]);
  
  const searchFiles = useCallback((query: string) => {
    return Object.keys(files).filter(path => 
      path.toLowerCase().includes(query.toLowerCase()) ||
      files[path].content.toLowerCase().includes(query.toLowerCase())
    );
  }, [files]);
  
  return {
    renameFile,
    duplicateFile,
    createFolder,
    getFileInfo,
    searchFiles
  };
}
