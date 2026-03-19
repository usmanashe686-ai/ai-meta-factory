'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Editor, { OnMount, BeforeMount, Monaco } from '@monaco-editor/react';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';

// Map file extensions to Monaco language IDs
const extensionToLanguage: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  py: 'python',
  dart: 'dart',
  sh: 'shell',
  yaml: 'yaml',
};

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return extensionToLanguage[ext] || 'plaintext';
}

// Recursive file finder (handles nested folders)
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

export const EnhancedCodeEditor: React.FC = () => {
  const { files, activeFileId, updateFileContent } = useProjectStore();
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Derive active file directly from store (no extra sync state)
  const activeFile = useMemo(
    () => (activeFileId ? findFile(files, activeFileId) : null),
    [files, activeFileId]
  );

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Custom theme
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e2e',
        'editor.lineHighlightBackground': '#2a2a3a',
      },
    });
    monaco.editor.setTheme('custom-dark');
  };

  if (!mounted) {
    return <div className="h-full w-full bg-gray-900" />;
  }

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-400">
        <p>No file selected</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900">
      <Editor
        path={activeFile.id}
        height="100%"
        language={getLanguageFromFileName(activeFile.name)}
        value={activeFile.content || ''}
        onChange={(val) => updateFileContent(activeFile.id, val || '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          theme: 'custom-dark',
        }}
      />
    </div>
  );
};
