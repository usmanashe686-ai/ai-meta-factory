"use client";

import { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useProjectStore } from '../state/project-store';
import { FileTabs } from './FileTabs';

export function CodeEditor() {
  const { files, activeFile, updateFile } = useProjectStore();
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
  
  if (!activeFile || !files[activeFile]) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <p className="text-gray-500">Select a file to edit</p>
      </div>
    );
  }
  
  const file = files[activeFile];
  const language = file.language === 'typescript' ? 'typescript' :
                   file.language === 'javascript' ? 'javascript' :
                   file.language === 'python' ? 'python' :
                   file.language === 'dart' ? 'dart' :
                   file.language === 'css' ? 'css' :
                   file.language === 'json' ? 'json' :
                   file.language === 'yaml' ? 'yaml' : 'plaintext';
  
  return (
    <div className="h-full flex flex-col">
      <FileTabs />
      
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
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
