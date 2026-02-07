"use client";

import { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useProjectStore } from '../state/project-store';
import { FileTabs } from './FileTabs';
import { detectLanguage } from '../state/project-store';

export function CodeEditor() {
  const { files, activeFile, updateFile, setActiveFile } = useProjectStore();
  const editorRef = useRef<any>(null);
  
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };
  
  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFile(activeFile, value);
    }
  };
  
  // Set default active file if none
  useEffect(() => {
    if (!activeFile && Object.keys(files).length > 0) {
      setActiveFile(Object.keys(files)[0]);
    }
  }, [activeFile, files, setActiveFile]);
  
  if (!activeFile || !files[activeFile]) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">No file selected</p>
          <p className="text-sm text-gray-600">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }
  
  const file = files[activeFile];
  
  return (
    <div className="h-full flex flex-col">
      {/* File Tabs */}
      <FileTabs />
      
      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={file.language}
          value={file.content}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabSize: 2,
            scrollBeyondLastLine: false,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
          }}
        />
      </div>
    </div>
  );
}
