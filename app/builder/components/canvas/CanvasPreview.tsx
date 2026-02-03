"use client";

import { useState } from 'react';
import { File, Folder, ChevronRight, ChevronDown, Copy, Eye, Code } from 'lucide-react';

interface CanvasPreviewProps {
  files: Record<string, string>;
}

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: FileNode[];
}

export default function CanvasPreview({ files }: CanvasPreviewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // Build file tree structure
  const buildFileTree = (): FileNode[] => {
    const root: FileNode[] = [];
    const nodes = new Map<string, FileNode>();

    Object.keys(files).sort().forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const isFile = i === parts.length - 1;
        const name = parts[i];
        currentPath = currentPath ? `${currentPath}/${name}` : name;
        
        if (!nodes.has(currentPath)) {
          const node: FileNode = {
            name,
            path: currentPath,
            isDirectory: !isFile,
            children: []
          };
          nodes.set(currentPath, node);
          
          // Find parent
          const parentPath = parts.slice(0, i).join('/');
          if (i === 0) {
            root.push(node);
          } else {
            const parent = nodes.get(parentPath);
            if (parent) {
              parent.children.push(node);
              parent.children.sort((a, b) => {
                if (a.isDirectory === b.isDirectory) {
                  return a.name.localeCompare(b.name);
                }
                return a.isDirectory ? -1 : 1;
              });
            }
          }
        }
      }
    });

    return root;
  };
  
  // Get file icon
  const getFileIcon = (filename: string, isDirectory: boolean) => {
    if (isDirectory) {
      return expandedFolders.has(filename) ? 
        <ChevronDown className="w-4 h-4 text-blue-500" /> : 
        <ChevronRight className="w-4 h-4 text-gray-500" />;
    }
    
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    switch (ext) {
      case 'ts': case 'tsx': case 'js': case 'jsx':
        return <Code className={`${iconClass} text-blue-500`} />;
      case 'json':
        return <Code className={`${iconClass} text-yellow-500`} />;
      case 'css': case 'scss':
        return <Code className={`${iconClass} text-purple-500`} />;
      case 'md':
        return <File className={`${iconClass} text-gray-500`} />;
      default:
        return <File className={`${iconClass} text-gray-400`} />;
    }
  };
  
  // Toggle folder
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };
  
  // Copy file content
  const copyFileContent = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => alert('Copied to clipboard!'))
      .catch(() => alert('Failed to copy'));
  };
  
  // Render file tree
  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => {
      const isSelected = !node.isDirectory && selectedFile === node.path;
      const isExpanded = node.isDirectory && expandedFolders.has(node.path);
      
      return (
        <div key={node.path}>
          <div
            onClick={() => node.isDirectory ? toggleFolder(node.path) : setSelectedFile(node.path)}
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${depth * 20 + 16}px` }}
          >
            {getFileIcon(node.name, node.isDirectory)}
            <span className="ml-2 text-sm text-gray-700">{node.name}</span>
            {!node.isDirectory && (
              <span className="ml-auto text-xs text-gray-500">
                {files[node.path]?.split('\n').length || 0} lines
              </span>
            )}
          </div>
          
          {node.isDirectory && isExpanded && node.children.length > 0 && (
            <div>
              {renderFileTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };
  
  const fileTree = buildFileTree();
  const selectedContent = selectedFile ? files[selectedFile] : null;
  
  return (
    <div className="flex h-full border rounded-lg overflow-hidden">
      {/* File Tree Sidebar */}
      <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Folder className="w-4 h-4 mr-2 text-blue-500" />
            Project Files ({Object.keys(files).length})
          </h3>
        </div>
        <div className="p-2">
          {fileTree.length > 0 ? (
            renderFileTree(fileTree)
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No files generated yet</p>
              <p className="text-sm mt-2">Generate components to see files here</p>
            </div>
          )}
        </div>
      </div>
      
      {/* File Preview */}
      <div className="flex-1 flex flex-col">
        {selectedContent ? (
          <>
            <div className="border-b bg-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Code className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-mono text-sm text-gray-900">{selectedFile}</span>
                <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {selectedFile?.split('.').pop()?.toUpperCase() || 'TEXT'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyFileContent(selectedContent)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={() => window.open(`data:text/plain,${encodeURIComponent(selectedContent)}`, '_blank')}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Eye className="w-4 h-4" />
                  Open
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-900">
              <pre className="p-6 text-gray-100 text-sm font-mono">
                {selectedContent}
              </pre>
            </div>
            
            <div className="border-t bg-gray-900 text-gray-400 px-4 py-2 text-xs flex justify-between">
              <div>
                Lines: {selectedContent.split('\n').length}
                <span className="mx-2">•</span>
                Size: {new Blob([selectedContent]).size} bytes
              </div>
              <div>
                UTF-8
                <span className="mx-2">•</span>
                LF
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a file to preview</p>
              <p className="text-sm mt-2">Click on any file in the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
