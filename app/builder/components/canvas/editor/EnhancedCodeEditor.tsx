'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../state/project-store';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export const EnhancedCodeEditor = () => {
  const store = useProjectStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !store) {
    return <div className="h-full bg-gray-900 animate-pulse" />;
  }

  const activeFile = store.files?.find(f => f.id === store.activeFileId);

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a file
      </div>
    );
  }

  const ext = activeFile.name.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    html: 'html', css: 'css', json: 'json', md: 'markdown',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
  };
  const language = languageMap[ext] || 'plaintext';

  return (
    <div className="h-full w-full bg-gray-900">
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        value={activeFile.content || ''}
        onChange={(val) => store.updateFileContent(activeFile.id, val || '')}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          automaticLayout: true,
          wordWrap: 'on',
          lineNumbers: 'on',
          tabSize: 2,
        }}
      />
    </div>
  );
};
