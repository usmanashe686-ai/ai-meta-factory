"use client";

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Code, Zap, Settings } from 'lucide-react';

// Dynamically import Monaco Editor (client-side only)
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading advanced editor...</span>
      </div>
    )
  }
);

interface MonacoEditorProps {
  files: Record<string, string>;
  activeFile: string | null;
  onFileChange: (fileName: string, content: string) => void;
  onActiveFileChange: (fileName: string) => void;
}

export const AdvancedMonacoEditor: React.FC<MonacoEditorProps> = ({
  files,
  activeFile,
  onFileChange,
  onActiveFileChange
}) => {
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined) {
      onFileChange(activeFile, value);
    }
  }, [activeFile, onFileChange]);

  // Get language for Monaco
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'html': return 'html';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'yaml': case 'yml': return 'yaml';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex h-full">
      {/* File Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Code className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">Advanced Editor</span>
            </div>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
        
        {/* File List */}
        <div className="py-2">
          {Object.keys(files).map(fileName => (
            <div
              key={fileName}
              onClick={() => onActiveFileChange(fileName)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-800 transition-colors ${
                activeFile === fileName ? 'bg-blue-900/30 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 text-blue-400">
                  {fileName.endsWith('.tsx') || fileName.endsWith('.ts') ? '📘' :
                   fileName.endsWith('.jsx') || fileName.endsWith('.js') ? '📗' :
                   fileName.endsWith('.css') ? '🎨' :
                   fileName.endsWith('.json') ? '📋' : '📄'}
                </div>
                <span className="text-sm text-gray-300 truncate">{fileName}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {files[fileName].split('\n').length} lines • {getLanguage(fileName)}
              </div>
            </div>
          ))}
        </div>

        {/* Editor Settings */}
        <div className="mt-8 px-4">
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
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
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
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500 block mb-1">Word Wrap</label>
              <select
                value={wordWrap}
                onChange={(e) => setWordWrap(e.target.value as 'on' | 'off')}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  );
};
