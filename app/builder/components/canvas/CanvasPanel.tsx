"use client";

import { useState, useEffect } from 'react';
import CanvasPreview from './CanvasPreview';
import CanvasDiffView from './CanvasDiffView';
import { CodeEditor } from './CodeEditor';

interface CanvasPanelProps {
  baseFiles: Record<string, string>;
  generatedFiles: Record<string, string>;
  onGenerateComponents: () => void;
  onFilesChange?: (fileName: string, content: string) => void;
  onExportZip?: () => void;
}

type CanvasMode = 'preview' | 'diff' | 'editor';

export default function CanvasPanel({
  baseFiles,
  generatedFiles,
  onGenerateComponents,
  onFilesChange,
  onExportZip
}: CanvasPanelProps) {
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('preview');
  const [activeEditorFile, setActiveEditorFile] = useState<string | null>(null);
  
  // When files change in editor, update parent
  const handleFileChange = (fileName: string, content: string) => {
    if (onFilesChange) {
      onFilesChange(fileName, content);
    }
  };
  
  // Handle "Edit" button from diff view
  const handleOpenEditor = (fileName: string) => {
    setActiveEditorFile(fileName);
    setCanvasMode('editor');
  };
  
  // Get file stats for summary
  const totalFiles = Object.keys(generatedFiles).length;
  const totalLines = Object.values(generatedFiles)
    .reduce((sum, content) => sum + content.split('\n').length, 0);
  
  // Calculate diff summary when in diff mode
  const hasChanges = Object.keys(baseFiles).length > 0 && 
                    JSON.stringify(baseFiles) !== JSON.stringify(generatedFiles);
  
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Component Canvas</h2>
            <p className="text-sm text-gray-600">
              {totalFiles} generated file{totalFiles !== 1 ? 's' : ''} • {totalLines} total lines
            </p>
          </div>
          
          {/* Mode Tabs */}
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
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {canvasMode !== 'editor' && (
            <button
              onClick={onGenerateComponents}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generate Components
            </button>
          )}
          
          {canvasMode === 'editor' && onExportZip && (
            <button
              onClick={onExportZip}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export ZIP
            </button>
          )}
          
          {canvasMode === 'diff' && hasChanges && (
            <button
              onClick={() => setCanvasMode('editor')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit All Files
            </button>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {canvasMode === 'preview' && (
          <div className="p-6">
            <CanvasPreview files={generatedFiles} />
          </div>
        )}
        
        {canvasMode === 'diff' && (
          <div className="h-full">
            <CanvasDiffView
              before={baseFiles}
              after={generatedFiles}
              onOpenEditor={handleOpenEditor}
            />
          </div>
        )}
        
        {canvasMode === 'editor' && (
          <div className="h-full">
            <CodeEditor
              files={generatedFiles}
              onFileChange={handleFileChange}
              activeFile={activeEditorFile}
              onActiveFileChange={setActiveEditorFile}
            />
          </div>
        )}
      </div>
      
      {/* Summary Footer */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            <span className="font-medium">{totalFiles} files</span>
            <span className="mx-2">•</span>
            <span>{totalLines} lines of code</span>
            {canvasMode === 'diff' && hasChanges && (
              <>
                <span className="mx-2">•</span>
                <span className="text-green-600 font-medium">Changes detected</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {canvasMode === 'preview' && (
              <button
                onClick={() => setCanvasMode('diff')}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Changes
              </button>
            )}
            {canvasMode === 'diff' && (
              <button
                onClick={() => setCanvasMode('preview')}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Back to Preview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
