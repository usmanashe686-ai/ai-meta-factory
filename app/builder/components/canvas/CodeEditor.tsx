"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, FileCode, FileText, FileJson, FileImage, Database, Settings, Package, Layout, Folder, FolderOpen } from 'lucide-react';
import SimpleCodeEditor from 'react-simple-code-editor';

interface CodeEditorProps {
  files: Record<string, string>;
  onFileChange: (fileName: string, content: string) => void;
  activeFile?: string | null;
  onActiveFileChange?: (fileName: string | null) => void;
}

interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: FileTreeNode[];
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  onFileChange,
  activeFile,
  onActiveFileChange
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(activeFile || null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editorContent, setEditorContent] = useState<string>('');
  const [prismLoaded, setPrismLoaded] = useState(false);

  // Simple prism highlight function
  const highlightCode = useCallback((code: string, language: string) => {
    if (!prismLoaded || typeof window === 'undefined') {
      return code;
    }
    
    try {
      // Dynamically import prism components based on language
      const importPrismComponent = async (lang: string) => {
        switch (lang) {
          case 'typescript':
            await import('prismjs/components/prism-typescript');
            break;
          case 'javascript':
            await import('prismjs/components/prism-javascript');
            break;
          case 'json':
            await import('prismjs/components/prism-json');
            break;
          case 'css':
            await import('prismjs/components/prism-css');
            break;
          case 'python':
            await import('prismjs/components/prism-python');
            break;
          default:
            break;
        }
      };
      
      // Use a simple highlight that doesn't require complex types
      return code
        .split('\n')
        .map(line => `<span class="line">${line}</span>`)
        .join('\n');
    } catch (error) {
      console.warn('Failed to highlight code:', error);
      return code;
    }
  }, [prismLoaded]);

  // Load prism on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('prismjs').then(() => {
        setPrismLoaded(true);
      }).catch(console.error);
    }
  }, []);

  // Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Get language for syntax highlighting
  const getLanguage = (filename: string): string => {
    const ext = getFileExtension(filename);
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': case 'scss': case 'sass': return 'css';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'yaml': case 'yml': return 'yaml';
      case 'md': return 'markdown';
      case 'html': case 'htm': return 'html';
      default: return 'plain';
    }
  };

  // Get file icon
  const getFileIcon = (filename: string, isDirectory: boolean): React.ReactNode => {
    if (isDirectory) {
      return expandedFolders.has(filename) ? 
        <FolderOpen className="w-4 h-4 text-blue-400" /> : 
        <Folder className="w-4 h-4 text-blue-400" />;
    }

    const ext = getFileExtension(filename);
    const iconClass = "w-4 h-4";
    
    switch (ext) {
      case 'ts': case 'tsx': 
        return <FileCode className={`${iconClass} text-blue-500`} />;
      case 'js': case 'jsx': 
        return <FileCode className={`${iconClass} text-yellow-500`} />;
      case 'json':
        return <FileJson className={`${iconClass} text-yellow-600`} />;
      case 'css': case 'scss': case 'sass':
        return <FileText className={`${iconClass} text-purple-500`} />;
      case 'html': case 'htm':
        return <FileText className={`${iconClass} text-orange-500`} />;
      case 'md':
        return <FileText className={`${iconClass} text-blue-400`} />;
      case 'py':
        return <FileCode className={`${iconClass} text-green-500`} />;
      case 'java':
        return <FileCode className={`${iconClass} text-red-500`} />;
      case 'yml': case 'yaml':
        return <Settings className={`${iconClass} text-cyan-500`} />;
      case 'svg': case 'png': case 'jpg': case 'jpeg': case 'gif':
        return <FileImage className={`${iconClass} text-green-400`} />;
      case 'db': case 'sql':
        return <Database className={`${iconClass} text-teal-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  // Build file tree
  const buildFileTree = useCallback((): FileTreeNode[] => {
    const root: FileTreeNode[] = [];
    const nodes = new Map<string, FileTreeNode>();

    Object.keys(files).sort().forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const isFile = i === parts.length - 1;
        const name = parts[i];
        currentPath = currentPath ? `${currentPath}/${name}` : name;
        
        if (!nodes.has(currentPath)) {
          const node: FileTreeNode = {
            name,
            path: currentPath,
            isDirectory: !isFile,
            children: []
          };
          nodes.set(currentPath, node);
          
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
  }, [files]);

  // Handle file selection
  const handleFileSelect = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      const newExpanded = new Set(expandedFolders);
      if (newExpanded.has(fileName)) {
        newExpanded.delete(fileName);
      } else {
        newExpanded.add(fileName);
      }
      setExpandedFolders(newExpanded);
    } else {
      setSelectedFile(fileName);
      setEditorContent(files[fileName] || '');
      if (onActiveFileChange) {
        onActiveFileChange(fileName);
      }
    }
  };

  // Handle content change
  const handleContentChange = async (content: string) => {
    setEditorContent(content);
    if (selectedFile) {
      onFileChange(selectedFile, content);
    }
  };

  // Sync with activeFile prop
  useEffect(() => {
    if (activeFile && files[activeFile] && selectedFile !== activeFile) {
      setSelectedFile(activeFile);
      setEditorContent(files[activeFile]);
    }
  }, [activeFile, files, selectedFile]);

  // Initialize with first file
  useEffect(() => {
    const fileKeys = Object.keys(files);
    if (fileKeys.length > 0 && !selectedFile) {
      const firstFile = fileKeys[0];
      setSelectedFile(firstFile);
      setEditorContent(files[firstFile]);
      if (onActiveFileChange) {
        onActiveFileChange(firstFile);
      }
    }
  }, [files, selectedFile, onActiveFileChange]);

  // Render file tree
  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map(node => {
      const isSelected = !node.isDirectory && selectedFile === node.path;
      const isExpanded = node.isDirectory && expandedFolders.has(node.path);
      
      return (
        <div key={node.path}>
          <div
            onClick={() => handleFileSelect(node.path, node.isDirectory)}
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-800 transition-colors ${
              isSelected ? 'bg-blue-900/30 border-r-2 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
          >
            {node.isDirectory ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-400 mr-2" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400 mr-2" />
                )}
                {getFileIcon(node.name, true)}
                <span className="ml-2 text-sm text-gray-300">{node.name}</span>
              </>
            ) : (
              <>
                <div className="w-5 mr-2 flex justify-center">
                  {getFileIcon(node.name, false)}
                </div>
                <span className="text-sm text-gray-200">{node.name}</span>
              </>
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
  const currentLanguage = selectedFile ? getLanguage(selectedFile) : 'plain';

  return (
    <div className="flex h-full">
      {/* File Tree Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center">
            <Package className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">Project Files</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {Object.keys(files).length} files
          </div>
        </div>
        
        <div className="py-2">
          {fileTree.length > 0 ? (
            renderFileTree(fileTree)
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No files generated yet
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        {selectedFile && (
          <div className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              {getFileIcon(selectedFile, false)}
              <span className="ml-2 font-mono text-sm text-gray-300">{selectedFile}</span>
              <span className="ml-3 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                {currentLanguage.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {files[selectedFile]?.split('\n').length || 0} lines
            </div>
          </div>
        )}

        {/* Code Editor */}
        <div className="flex-1 overflow-auto bg-gray-950">
          {selectedFile ? (
            <SimpleCodeEditor
              value={editorContent}
              onValueChange={handleContentChange}
              highlight={code => code} // Simplified for now
              padding={16}
              className="font-mono text-sm min-h-full"
              style={{
                fontSize: '14px',
                fontFamily: '"Fira Code", "Consolas", monospace',
                backgroundColor: '#0a0a0a',
                color: '#e4e4e7',
                minHeight: '100%',
                outline: 'none'
              }}
              textareaClassName="focus:outline-none"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileCode className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                <p className="text-lg">Select a file to start editing</p>
                <p className="text-sm mt-2">Click on any file in the sidebar</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>AI Generated • Ready to Edit</span>
            </div>
            {selectedFile && (
              <>
                <span>•</span>
                <span>{getFileExtension(selectedFile).toUpperCase()}</span>
                <span>•</span>
                <span>{currentLanguage}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>UTF-8</span>
            <span>•</span>
            <span>LF</span>
          </div>
        </div>
      </div>
    </div>
  );
};
