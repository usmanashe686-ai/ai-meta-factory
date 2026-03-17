"use client";

import React, { useEffect, useRef, useState } from 'react';
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

interface EnhancedCodeEditorProps {
  fileId?: string;
}

export const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({ fileId }) => {
  const { files, activeFileId, updateFileContent } = useProjectStore();
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [editorLanguage, setEditorLanguage] = useState<string>('plaintext');
  const editorRef = useRef<any>(null);

  const targetFileId = fileId || activeFileId;

  useEffect(() => {
    if (!targetFileId) {
      setActiveFile(null);
      return;
    }

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

    const file = findFile(files, targetFileId);
    setActiveFile(file || null);
    if (file) {
      setEditorLanguage(getLanguageFromFileName(file.name));
    }
  }, [files, targetFileId]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#111827', // Matches Tailwind gray-900
        'editor.lineHighlightBackground': '#1f2937',
      },
    });

    monaco.editor.setTheme('custom-dark');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile.id, value);
    }
  };

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
    });
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-500">
        <div className="text-center">
          <p>No file open</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900 overflow-hidden">
      <Editor
        height="100%"
        language={editorLanguage}
        value={activeFile.content || ''}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          theme: 'custom-dark',
          padding: { top: 16 },
        }}
      />
    </div>
  );
};
EOFcat << 'EOF' > app/builder/components/canvas/editor/EnhancedCodeEditor.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
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

interface EnhancedCodeEditorProps {
  fileId?: string;
}

export const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({ fileId }) => {
  const { files, activeFileId, updateFileContent } = useProjectStore();
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [editorLanguage, setEditorLanguage] = useState<string>('plaintext');
  const editorRef = useRef<any>(null);

  const targetFileId = fileId || activeFileId;

  useEffect(() => {
    if (!targetFileId) {
      setActiveFile(null);
      return;
    }

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

    const file = findFile(files, targetFileId);
    setActiveFile(file || null);
    if (file) {
      setEditorLanguage(getLanguageFromFileName(file.name));
    }
  }, [files, targetFileId]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#111827', // Matches Tailwind gray-900
        'editor.lineHighlightBackground': '#1f2937',
      },
    });

    monaco.editor.setTheme('custom-dark');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile.id, value);
    }
  };

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
    });
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-500">
        <div className="text-center">
          <p>No file open</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900 overflow-hidden">
      <Editor
        height="100%"
        language={editorLanguage}
        value={activeFile.content || ''}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          theme: 'custom-dark',
          padding: { top: 16 },
        }}
      />
    </div>
  );
};
