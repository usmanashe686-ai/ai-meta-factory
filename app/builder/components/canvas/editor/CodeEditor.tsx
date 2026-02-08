"use client";

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Save, FileCode, Loader2 } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

const getLanguageFromPath = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'py':
      return 'python';
    case 'dart':
      return 'dart';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'scss':
    case 'sass':
      return 'scss';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'sql':
      return 'sql';
    case 'sh':
      return 'shell';
    case 'dockerfile':
      return 'dockerfile';
    default:
      return 'plaintext';
  }
};

export function CodeEditor() {
  const { activeFile, files, updateFile } = useProjectStore();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (activeFile && files[activeFile]) {
      setContent(files[activeFile].content);
      setEditorKey(prev => prev + 1); // Force remount of editor
    }
  }, [activeFile, files]);

  const handleSave = () => {
    if (!activeFile) return;
    
    setIsSaving(true);
    updateFile(activeFile, content);
    
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  if (!activeFile || !files[activeFile]) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900">
        <FileCode className="w-16 h-16 text-gray-700 mb-4" />
        <p className="text-gray-500">Select a file to start editing</p>
      </div>
    );
  }

  const file = files[activeFile];
  const language = getLanguageFromPath(activeFile);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Editor Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="font-mono text-sm truncate">{activeFile}</span>
          <span className="text-xs px-2 py-0.5 bg-gray-800 rounded">
            {language}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded text-sm flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          key={editorKey}
          language={language}
          value={content}
          onChange={(value) => setContent(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabSize: 2,
          }}
        />
      </div>
      
      {/* Editor Footer */}
      <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
        <div>
          Line: 1, Column: 1
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>{content.length} characters</span>
        </div>
      </div>
    </div>
  );
}
