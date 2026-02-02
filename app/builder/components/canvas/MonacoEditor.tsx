"use client";

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Code, Zap, Settings, FileText, FileCode, FileJson, Folder, ChevronRight, ChevronDown } from 'lucide-react';

// Dynamically import Monaco Editor (client-side only)
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-600">Loading advanced editor...</p>
          <p className="text-sm text-gray-500 mt-1">Powered by Monaco (VS Code engine)</p>
        </div>
      </div>
    )
  }
);

interface AdvancedMonacoEditorProps {
  files: Record<string, string>;
  activeFile: string | null;
  onFileChange: (fileName: string, content: string) => void;
  onActiveFileChange: (fileName: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

export const AdvancedMonacoEditor: React.FC<AdvancedMonacoEditorProps> = ({
  files,
  activeFile,
  onFileChange,
  onActiveFileChange
}) => {
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileTree, setFileTree] = useState<FileNode[]>([]);

  // Build file tree from flat files object
  useEffect(() => {
    const tree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    // Sort files for consistent display
    const sortedFiles = Object.keys(files).sort();

    sortedFiles.forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const isFile = i === parts.length - 1;
        const name = parts[i];
        const path = currentPath ? `${currentPath}/${name}` : name;
        
        if (!pathMap.has(path)) {
          const node: FileNode = {
            name,
            path,
            isDirectory: !isFile
          };
          
          pathMap.set(path, node);
          
          // Find parent
          if (i === 0) {
            tree.push(node);
          } else {
            const parentPath = parts.slice(0, i).join('/');
            const parent = pathMap.get(parentPath);
            if (parent) {
              if (!parent.children) {
                parent.children = [];
              }
              parent.children.push(node);
            }
          }
        }
        
        currentPath = path;
      }
    });

    setFileTree(tree);
  }, [files]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined) {
      onFileChange(activeFile, value);
    }
  }, [activeFile, onFileChange]);

  // Get language for Monaco
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'html': case 'htm': return 'html';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'yaml': case 'yml': return 'yaml';
      case 'xml': return 'xml';
      case 'sql': return 'sql';
      case 'sh': return 'shell';
      case 'dockerfile': return 'dockerfile';
      default: return 'plaintext';
    }
  };

  const getFileIcon = (filename: string, isDirectory: boolean): React.ReactNode => {
    if (isDirectory) {
      return expandedFolders.has(filename) ? 
        <ChevronDown className="w-3 h-3 text-blue-400 mr-2" /> : 
        <ChevronRight className="w-3 h-3 text-gray-400 mr-2" />;
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4 mr-2";
    
    switch (ext) {
      case 'ts': case 'tsx': 
        return <FileCode className={`${iconClass} text-blue-500`} />;
      case 'js': case 'jsx': 
        return <FileCode className={`${iconClass} text-yellow-500`} />;
      case 'json':
        return <FileJson className={`${iconClass} text-yellow-600`} />;
      case 'css': case 'scss':
        return <FileText className={`${iconClass} text-purple-500`} />;
      case 'html': case 'htm':
        return <FileText className={`${iconClass} text-orange-500`} />;
      case 'md':
        return <FileText className={`${iconClass} text-blue-400`} />;
      case 'py':
        return <FileCode className={`${iconClass} text-green-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-400`} />;
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => {
      const isSelected = !node.isDirectory && activeFile === node.path;
      const isExpanded = node.isDirectory && expandedFolders.has(node.path);
      
      return (
        <div key={node.path}>
          <div
            onClick={() => {
              if (node.isDirectory) {
                toggleFolder(node.path);
              } else {
                onActiveFileChange(node.path);
              }
            }}
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-800 transition-colors ${
              isSelected ? 'bg-blue-900/30 border-r-2 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${depth * 20 + 16}px` }}
          >
            {node.isDirectory ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-blue-400 mr-2" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400 mr-2" />
                )}
                <Folder className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm text-gray-300">{node.name}</span>
              </>
            ) : (
              <>
                {getFileIcon(node.name, false)}
                <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {node.name}
                </span>
              </>
            )}
          </div>
          
          {node.isDirectory && node.children && isExpanded && (
            <div>
              {renderFileTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-full">
      {/* File Tree Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Code className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">Monaco Editor</span>
            </div>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {Object.keys(files).length} files • VS Code engine
          </div>
        </div>
        
        {/* File List */}
        <div className="flex-1 overflow-y-auto py-2">
          {fileTree.length > 0 ? (
            renderFileTree(fileTree)
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No files generated yet
            </div>
          )}
        </div>

        {/* Editor Settings Panel */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center mb-3">
            <Settings className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-xs font-medium text-gray-400">Editor Settings</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'vs-dark' | 'light')}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 block mb-1">Font Size: {fontSize}px</label>
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500 block mb-1">Word Wrap</label>
              <select
                value={wordWrap}
                onChange={(e) => setWordWrap(e.target.value as 'on' | 'off')}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>
            
            <div className="pt-2 border-t border-gray-800">
              <div className="text-xs text-gray-500 mb-2">Current File</div>
              {activeFile ? (
                <div className="text-sm text-gray-300 truncate">
                  {activeFile.split('/').pop()}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No file selected</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monaco Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        {activeFile && (
          <div className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              {getFileIcon(activeFile, false)}
              <span className="ml-2 font-mono text-sm text-gray-300">{activeFile}</span>
              <span className="ml-3 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                {getLanguage(activeFile).toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {files[activeFile]?.split('\n').length || 0} lines • {files[activeFile]?.length || 0} chars
            </div>
          </div>
        )}

        {/* Monaco Editor */}
        <div className="flex-1">
          {activeFile ? (
            <MonacoEditor
              height="100%"
              language={getLanguage(activeFile)}
              value={files[activeFile] || ''}
              onChange={handleEditorChange}
              theme={theme}
              options={{
                fontSize,
                wordWrap,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                formatOnType: true,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                readOnly: false,
                contextmenu: true,
                cursorBlinking: 'blink',
                cursorSmoothCaretAnimation: 'on',
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-950 text-gray-500">
              <div className="text-center p-8">
                <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-lg font-medium mb-2">Select a file to edit</p>
                <p className="text-sm mb-6">Choose a file from the sidebar to start editing with Monaco</p>
                <div className="text-xs text-gray-600 bg-gray-900 rounded-lg p-4 inline-block">
                  <div className="font-mono">// VS Code editor engine</div>
                  <div className="font-mono">// Intellisense • Syntax highlighting</div>
                  <div className="font-mono">// Code folding • Multi-cursor</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Monaco Editor</span>
            </div>
            {activeFile && (
              <>
                <span>•</span>
                <span>{getLanguage(activeFile)}</span>
                <span>•</span>
                <span>{files[activeFile]?.split('\n').length || 0} lines</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>{theme === 'vs-dark' ? 'Dark Theme' : 'Light Theme'}</span>
            <span>•</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
