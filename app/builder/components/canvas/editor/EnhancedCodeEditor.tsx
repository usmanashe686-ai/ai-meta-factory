"use client";

import { Controlled as CodeMirror } from 'react-codemirror2';
import { useProjectStore } from '../state/project-store';

// Required for CodeMirror
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/typescript/typescript');
require('codemirror/mode/jsx/jsx');
require('codemirror/mode/python/python');
require('codemirror/mode/css/css');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/mode/markdown/markdown');
require('codemirror/mode/yaml/yaml');
require('codemirror/mode/xml/xml');

const getFileLanguage = (path: string) => {
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts': case 'tsx': return 'typescript';
    case 'js': case 'jsx': return 'javascript';
    case 'py': return 'python';
    case 'dart': return 'dart';
    case 'css': case 'scss': return 'css';
    case 'json': return 'json';
    case 'yaml': case 'yml': return 'yaml';
    case 'md': return 'markdown';
    case 'html': return 'htmlmixed';
    default: return 'javascript';
  }
};

export function EnhancedCodeEditor() {
  const { files, activeFile, updateFile } = useProjectStore();
  
  const file = activeFile ? files[activeFile] : null;
  const content = file?.content || "";
  
  const handleBeforeChange = (editor: any, data: any, value: string) => {
    if (activeFile) {
      updateFile(activeFile, value);
    }
  };
  
  const handleEditorDidMount = (editor: any) => {
    editor.focus();
  };

  return (
    <CodeMirror
      value={content}
      options={{
        mode: activeFile ? getFileLanguage(activeFile) : 'javascript',
        theme: 'material',
        lineNumbers: true,
      }}
      onBeforeChange={handleBeforeChange}
      editorDidMount={handleEditorDidMount}
    />
  );
}
