'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount, BeforeMount, Monaco } from '@monaco-editor/react';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';
import * as monaco from 'monaco-editor';

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

export function CodeEditor() {
  const { files, activeFileId, updateFileContent } = useProjectStore();
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    if (!activeFileId || !files) {
      setActiveFile(null);
      setMounted(false);
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
    const file = findFile(files, activeFileId);
    setActiveFile(file || null);
    setMounted(true);
  }, [files, activeFileId]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
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
    });
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#1e1e2e' },
    });
    monaco.editor.setTheme('custom-dark');
  };

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
    });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
      jsx: monaco.languages.typescript.JsxEmit.React,
    });
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      'declare const React: any;',
      'global.d.ts'
    );
  };

  if (!mounted || !activeFile) {
    return <div className="h-full bg-gray-900" />;
  }

  const language = getLanguageFromFileName(activeFile.name);

  return (
    <div className="h-full w-full bg-gray-900">
      <Editor
        height="100%"
        language={language}
        value={activeFile.content || ''}
        onChange={(value) => {
          if (activeFile && value !== undefined) {
            updateFileContent(activeFile.path, value);
          }
        }}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
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
          theme: 'vs-dark',
        }}
      />
    </div>
  );
}
