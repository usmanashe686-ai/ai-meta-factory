'use client';

import React, { useEffect, useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { useProjectStore } from '../state/project-store';
import { validateFileForPreview, getFileLanguage } from '../preview/preview-utils';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/python/python';
import 'codemirror/mode/markdown/markdown';

export function EnhancedCodeEditor() {
  const { activeFile, files, updateFileContent } = useProjectStore();
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (activeFile && files[activeFile]) {
      setContent(files[activeFile].content);
      setErrors(validateFileForPreview(activeFile, files[activeFile].content));
    }
  }, [activeFile, files]);

  const handleChange = (editor: any, data: any, value: string) => {
    setContent(value);
    updateFileContent(activeFile, value);
    setErrors(validateFileForPreview(activeFile, value));
  };

  const mode = activeFile ? getFileLanguage(activeFile) : 'javascript';

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={content}
          options={{
            mode: mode,
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
          }}
          onBeforeChange={handleChange}
        />
      </div>
      {errors.length > 0 && (
        <div className="bg-red-900/20 text-red-400 text-sm p-2">
          {errors.map((err, i) => (
            <div key={i}>⚠ {err}</div>
          ))}
        </div>
      )}
    </div>
  );
}
import { EditorTabs } from '../ui/EditorTabs';

export function EnhancedCodeEditor() {
  // ...existing code

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <EditorTabs />
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={content}
          options={{
            mode: mode,
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
          }}
          onBeforeChange={handleChange}
        />
      </div>
      {errors.length > 0 && (
        <div className="bg-red-900/20 text-red-400 text-sm p-2">
          {errors.map((err, i) => (
            <div key={i}>⚠ {err}</div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useRef } from 'react';

export function EnhancedCodeEditor() {
  const editorRef = useRef<any>(null);

  const handleUndo = () => {
    if (editorRef.current) editorRef.current.getDoc().undo();
  };
  const handleRedo = () => {
    if (editorRef.current) editorRef.current.getDoc().redo();
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <EditorTabs />
      <div className="flex gap-2 p-2 bg-gray-800">
        <button onClick={handleUndo} className="px-2 py-1 bg-gray-700 rounded text-sm">Undo</button>
        <button onClick={handleRedo} className="px-2 py-1 bg-gray-700 rounded text-sm">Redo</button>
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          ref={editorRef}
          value={content}
          options={{
            mode: mode,
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
          }}
          onBeforeChange={handleChange}
        />
      </div>
      {errors.length > 0 && (
        <div className="bg-red-900/20 text-red-400 text-sm p-2">
          {errors.map((err, i) => (
            <div key={i}>⚠ {err}</div>
          ))}
        </div>
      )}
    </div>
  );
}
