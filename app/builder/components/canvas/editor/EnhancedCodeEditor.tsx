'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';
import type { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Map file extensions to Monaco language IDs
const extensionToLanguage: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  md: 'markdown',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  dart: 'dart',
  sql: 'sql',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
};

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return extensionToLanguage[ext] || 'plaintext';
}

export const EnhancedCodeEditor = () => {
  // Safe store access
  const store = useProjectStore();
  const files = store?.files || [];
  const activeFileId = store?.activeFileId || null;
  const updateFileContent = store?.updateFileContent || (() => {});

  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  // Find the active file
  useEffect(() => {
    if (!activeFileId || !files.length) return;

    const findFile = (nodes: FileNode[], id: string): FileNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findFile(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(files, activeFileId);
    if (file) {
      setContent(file.content || '');
      setLanguage(getLanguageFromFileName(file.name));
    }
  }, [activeFileId, files]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      wrappingIndent: 'same',
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });

    // Add custom themes or configure existing ones
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e2e',
        'editor.lineHighlightBackground': '#2a2a3a',
        'editor.selectionBackground': '#3a3a4a',
      },
    });

    monaco.editor.setTheme('custom-dark');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
      setContent(value); // keep local state in sync
    }
  };

  // Auto-save effect (optional)
  useEffect(() => {
    if (!editorRef.current || !activeFileId) return;
    const saveInterval = setInterval(() => {
      console.log('Auto-saving...');
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [activeFileId]);

  if (!activeFileId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <p className="text-lg">No file selected</p>
          <p className="text-sm mt-2">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900">
      {typeof window !== 'undefined' && (
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            wordWrap: 'on',
            wrappingIndent: 'same',
            lineNumbers: 'on',
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            theme: 'custom-dark',
          }}
        />
      )}
    </div>
  );
};
