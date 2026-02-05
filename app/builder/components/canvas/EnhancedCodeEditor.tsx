"use client";

import dynamic from 'next/dynamic';
import { Copy, Download } from 'lucide-react';
import { useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface EnhancedCodeEditorProps {
  files: Record<string, string>;
  onFileChange: (fileName: string, content: string) => void;
  activeFile?: string | null;
}

export function EnhancedCodeEditor({
  files,
  onFileChange,
  activeFile
}: EnhancedCodeEditorProps) {
  const [theme] = useState<'vs-dark'>('vs-dark');
  const [fontSize] = useState(14);

  const currentFileContent = activeFile ? files[activeFile] || '' : '';

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': case 'scss': return 'css';
      case 'html': return 'html';
      default: return 'plaintext';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFileContent);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([currentFileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.split('/').pop() || 'code.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {activeFile ? (
              <>
                <span className="font-mono text-sm text-white">{activeFile}</span>
                <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                  {getLanguage(activeFile).toUpperCase()}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">No file selected</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        {activeFile ? (
          <MonacoEditor
            height="100%"
            language={getLanguage(activeFile)}
            value={currentFileContent}
            theme={theme}
            onChange={(value) => onFileChange(activeFile, value || '')}
            options={{
              minimap: { enabled: true },
              fontSize,
              wordWrap: 'on',
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 2,
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg">Select a file to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
