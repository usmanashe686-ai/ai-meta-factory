"use client";

import { useState } from 'react';
import CanvasPreview from './CanvasPreview';
import { CanvasDiffView } from './CanvasDiffView'; // CHANGED: Named import
import { CodeEditor } from './CodeEditor';
import MonacoEditorWrapper from './MonacoEditor';

interface CanvasPanelProps {
  baseFiles: Record<string, string>;
  generatedFiles: Record<string, string>;
  onGenerateComponents: () => void;
  onFilesChange?: (fileName: string, content: string) => void;
  onExportZip?: () => void;
}

type CanvasMode = 'preview' | 'diff' | 'editor';
type EditorType = 'simple' | 'advanced';

export default function CanvasPanel({
  baseFiles,
  generatedFiles,
  onGenerateComponents,
  onFilesChange,
  onExportZip
}: CanvasPanelProps) {
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('preview');
  const [editorType, setEditorType] = useState<EditorType>('simple');
  const [activeEditorFile, setActiveEditorFile] = useState<string | null>(null);
  
  const handleFileChange = (fileName: string, content: string) => {
    if (onFilesChange) {
      onFilesChange(fileName, content);
    }
  };
  
  const handleOpenEditor = (fileName: string) => {
    setActiveEditorFile(fileName);
    setCanvasMode('editor');
  };
  
  const totalFiles = Object.keys(generatedFiles).length;
  const totalLines = Object.values(generatedFiles)
    .reduce((sum, content) => sum + content.split('\n').length, 0);
  
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': case 'scss': return 'css';
      case 'html': case 'htm': return 'html';
      case 'md': return 'markdown';
      case 'py': return 'python';
      default: return 'plaintext';
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Component Canvas</h2>
            <p className="text-sm text-gray-600">
              {totalFiles} generated file{totalFiles !== 1 ? 's' : ''} • {totalLines} total lines
            </p>
          </div>
          
          <div className="flex border-b border-gray-200 -mb-4">
            <button
              onClick={() => setCanvasMode('preview')}
              className={`px-4 py-2 text-sm font-medium ${
                canvasMode === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setCanvasMode('diff')}
              className={`px-4 py-2 text-sm font-medium ${
                canvasMode === 'diff'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Diff View
            </button>
            <button
              onClick={() => setCanvasMode('editor')}
              className={`px-4 py-2 text-sm font-medium ${
                canvasMode === 'editor'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Editor
            </button>
          </div>
          
          {canvasMode === 'editor' && (
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setEditorType('simple')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  editorType === 'simple' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setEditorType('advanced')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  editorType === 'advanced' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Monaco
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onGenerateComponents}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Generate Components
          </button>
          
          {canvasMode === 'editor' && onExportZip && (
            <button
              onClick={onExportZip}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export ZIP
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {canvasMode === 'preview' && (
          <div className="p-6">
            <CanvasPreview files={generatedFiles} />
          </div>
        )}
        
        {canvasMode === 'diff' && (
          <CanvasDiffView
            before={baseFiles}
            after={generatedFiles}
            onOpenEditor={handleOpenEditor}
          />
        )}
        
        {canvasMode === 'editor' && (
          <div className="h-full">
            {editorType === 'simple' ? (
              <CodeEditor
                files={generatedFiles}
                onFileChange={handleFileChange}
                activeFile={activeEditorFile}
                onActiveFileChange={setActiveEditorFile}
              />
            ) : (
              <div className="h-full flex flex-col">
                {activeEditorFile ? (
                  <>
                    <div className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="ml-2 font-mono text-sm text-gray-300">{activeEditorFile}</span>
                        <span className="ml-3 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                          {getLanguage(activeEditorFile).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {generatedFiles[activeEditorFile]?.split('\n').length || 0} lines
                      </div>
                    </div>
                    <div className="flex-1">
                      <MonacoEditorWrapper
                        value={generatedFiles[activeEditorFile] || ''}
                        language={getLanguage(activeEditorFile)}
                        onChange={(value) => handleFileChange(activeEditorFile, value)}
                        height="100%"
                        theme="vs-dark"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg">Select a file to edit with Monaco</p>
                      <p className="text-sm mt-2">VS Code editor engine with full IntelliSense</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-medium">{totalFiles} files</span>
            <span className="mx-2">•</span>
            <span>{totalLines} lines of code</span>
            {canvasMode === 'editor' && (
              <>
                <span className="mx-2">•</span>
                <span className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${editorType === 'simple' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                  {editorType === 'simple' ? 'Simple Editor' : 'Monaco Editor'}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Ready to export
            </span>
            <button 
              onClick={() => setCanvasMode('diff')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
