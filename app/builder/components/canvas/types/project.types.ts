export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  path: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface Project {
  id: string;
  name: string;
  files: FileNode[];
  // ... other project fields
}
