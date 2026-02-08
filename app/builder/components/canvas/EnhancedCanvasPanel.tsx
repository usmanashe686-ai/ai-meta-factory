"use client";

import { useEffect } from 'react';
import { StackConfig } from './types';

interface EnhancedCanvasPanelProps {
  initialFiles: Record<string, string>;
  onFilesChange: (files: Record<string, string>) => void;
  stack: StackConfig;
  projectName: string;
  session: any;
}

export default function EnhancedCanvasPanel(props: EnhancedCanvasPanelProps) {
  const {
    initialFiles = {},
    onFilesChange,
    stack,
    projectName = 'New Project',
    session
  } = props;

  // Simple fallback implementation since we don't have EnhancedCanvasLayout and project store
  useEffect(() => {
    if (onFilesChange && initialFiles) {
      // Notify parent about initial files
      onFilesChange(initialFiles);
    }
  }, [initialFiles, onFilesChange]);

  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Project Canvas</h2>
        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          {projectName}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="font-semibold mb-3 text-gray-700">Stack Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Frontend</div>
              <div className="font-medium mt-1">{stack.frontend}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Backend</div>
              <div className="font-medium mt-1">{stack.backend}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Database</div>
              <div className="font-medium mt-1">{stack.database}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Git Provider</div>
              <div className="font-medium mt-1">{stack.gitProvider}</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">Project Files</h3>
          <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
            {Object.keys(initialFiles).length > 0 ? (
              <div className="space-y-1">
                {Object.keys(initialFiles).map((file, index) => (
                  <div key={file} className="text-sm py-2 px-3 bg-white rounded border flex justify-between items-center">
                    <span className="truncate">{file}</span>
                    <span className="text-xs text-gray-500">{initialFiles[file].length} chars</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No files generated yet. Generate components from the AI Component Generator tab.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {session ? `Logged in as ${session.user?.name}` : 'Not logged in'}
          </div>
          <button 
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-black transition-colors"
            onClick={() => console.log('Save project')}
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}
