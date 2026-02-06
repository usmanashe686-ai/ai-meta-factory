import { useCallback } from 'react';
import { useProjectStore } from '../state/project-store';

export function useCanvasNavigation() {
  const { files, setActiveFile, createFile } = useProjectStore();
  
  const navigateToFile = useCallback((path: string) => {
    if (files[path]) {
      setActiveFile(path);
      return true;
    }
    return false;
  }, [files, setActiveFile]);
  
  const findFilesByType = useCallback((type: 'component' | 'page' | 'util') => {
    return Object.keys(files).filter(path => {
      if (type === 'component' && path.includes('/components/')) return true;
      if (type === 'page' && path.includes('/pages/') || path.includes('/app/')) return true;
      if (type === 'util' && path.includes('/utils/') || path.includes('/lib/')) return true;
      return false;
    });
  }, [files]);
  
  const getNextFile = useCallback((currentPath: string, direction: 'next' | 'prev') => {
    const filePaths = Object.keys(files).sort();
    const currentIndex = filePaths.indexOf(currentPath);
    
    if (currentIndex === -1) return null;
    
    if (direction === 'next') {
      return filePaths[currentIndex + 1] || filePaths[0];
    } else {
      return filePaths[currentIndex - 1] || filePaths[filePaths.length - 1];
    }
  }, [files]);
  
  return {
    navigateToFile,
    findFilesByType,
    getNextFile
  };
}
