"use client";

import { useProjectStore } from '../state/project-store';

export interface FileAction {
  type: 'create' | 'rename' | 'delete' | 'move' | 'duplicate';
  path: string;
  newPath?: string;
  content?: string;
}

export class FileManager {
  private store: ReturnType<typeof useProjectStore>;

  constructor(store: ReturnType<typeof useProjectStore>) {
    this.store = store;
  }

  createFile(path: string, content: string = '') {
    const { files, setFile } = this.store.getState();
    
    // Check if file already exists
    if (files[path]) {
      throw new Error(`File ${path} already exists`);
    }

    // Create parent directories if needed
    this.ensureDirectoryExists(path);

    setFile(path, content);
    return { success: true, path };
  }

  createFolder(path: string) {
    const { files } = this.store.getState();
    
    // Ensure folder path ends with /
    const folderPath = path.endsWith('/') ? path : path + '/';
    
    // Check if folder exists (as a file with same name)
    const conflictingFile = Object.keys(files).find(filePath => 
      filePath === folderPath || filePath.startsWith(folderPath)
    );
    
    if (conflictingFile) {
      throw new Error(`Folder ${folderPath} conflicts with existing file: ${conflictingFile}`);
    }

    // Add a placeholder to represent folder
    const placeholderPath = folderPath + '.folder-marker';
    this.createFile(placeholderPath, '');
    
    return { success: true, path: folderPath };
  }

  renameFile(oldPath: string, newPath: string) {
    const { files, setFile, deleteFile } = this.store.getState();
    
    if (!files[oldPath]) {
      throw new Error(`File ${oldPath} does not exist`);
    }

    if (files[newPath]) {
      throw new Error(`File ${newPath} already exists`);
    }

    const content = files[oldPath].content;
    
    // Copy to new location
    setFile(newPath, content);
    
    // Remove old file
    deleteFile(oldPath);
    
    // If renaming a folder, move all files inside
    if (oldPath.endsWith('/') || files[oldPath + '/']) {
      this.moveFolderContents(oldPath, newPath);
    }

    return { success: true, oldPath, newPath };
  }

  deleteFile(path: string) {
    const { files, deleteFile } = this.store.getState();
    
    if (!files[path]) {
      throw new Error(`File ${path} does not exist`);
    }

    // Check if it's a folder
    const isFolder = path.endsWith('/') || files[path]?.content === '';
    if (isFolder) {
      // Delete all files in folder
      const filesToDelete = Object.keys(files).filter(filePath => 
        filePath.startsWith(path)
      );
      filesToDelete.forEach(filePath => deleteFile(filePath));
    } else {
      deleteFile(path);
    }

    return { success: true, path };
  }

  duplicateFile(path: string) {
    const { files, setFile } = this.store.getState();
    
    if (!files[path]) {
      throw new Error(`File ${path} does not exist`);
    }

    const extension = path.split('.').pop();
    const baseName = path.replace(`.${extension}`, '');
    let newPath = '';
    let counter = 1;

    do {
      newPath = `${baseName}-copy${counter > 1 ? counter : ''}.${extension}`;
      counter++;
    } while (files[newPath]);

    const content = files[path].content;
    setFile(newPath, content);

    return { success: true, original: path, copy: newPath };
  }

  private ensureDirectoryExists(path: string) {
    const dirs = path.split('/').slice(0, -1);
    let currentPath = '';
    
    for (const dir of dirs) {
      if (dir) {
        currentPath += dir + '/';
        // Check if directory exists by looking for marker or any file
        const hasMarker = Object.keys(this.store.getState().files).some(
          filePath => filePath === currentPath + '.folder-marker' || 
                     filePath.startsWith(currentPath)
        );
        
        if (!hasMarker) {
          this.createFile(currentPath + '.folder-marker', '');
        }
      }
    }
  }

  private moveFolderContents(oldPath: string, newPath: string) {
    const { files, setFile, deleteFile } = this.store.getState();
    
    // Get all files in old folder
    const filesInFolder = Object.keys(files).filter(filePath => 
      filePath.startsWith(oldPath) && filePath !== oldPath
    );
    
    // Move each file
    filesInFolder.forEach(filePath => {
      const newFilePath = filePath.replace(oldPath, newPath);
      const content = files[filePath].content;
      
      setFile(newFilePath, content);
      deleteFile(filePath);
    });
  }

  searchFiles(query: string) {
    const { files } = this.store.getState();
    
    const results = Object.keys(files)
      .filter(path => {
        if (path.includes('.folder-marker')) return false;
        
        const fileName = path.split('/').pop() || '';
        const fileContent = files[path].content.toLowerCase();
        
        return (
          fileName.toLowerCase().includes(query.toLowerCase()) ||
          fileContent.includes(query.toLowerCase())
        );
      })
      .map(path => ({
        path,
        name: path.split('/').pop() || '',
        content: files[path].content,
        matches: this.findMatches(files[path].content, query)
      }));

    return results;
  }

  private findMatches(content: string, query: string) {
    const matches = [];
    const lines = content.split('\n');
    const queryLower = query.toLowerCase();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLower = line.toLowerCase();
      
      if (lineLower.includes(queryLower)) {
        const startIndex = lineLower.indexOf(queryLower);
        matches.push({
          line: i + 1,
          text: line,
          start: startIndex,
          end: startIndex + query.length
        });
      }
    }
    
    return matches;
  }
}
