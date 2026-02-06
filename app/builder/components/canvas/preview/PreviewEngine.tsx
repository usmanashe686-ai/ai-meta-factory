"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function PreviewEngine() {
  const { files, stack } = useProjectStore();
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    'Preview engine initialized',
    `Stack: ${stack.frontend.toUpperCase()}`,
  ]);
  
  const buildPreview = async () => {
    setIsBuilding(true);
    setLogs(prev => [...prev, 'Building preview...']);
    
    try {
      // Simulate build process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would:
      // 1. Bundle the code
      // 2. Start a dev server
      // 3. Return the URL
      
      const mockUrl = 'http://localhost:3000';
      setPreviewUrl(mockUrl);
      setLogs(prev => [...prev, 'Build complete!', 'Preview ready at ' + mockUrl]);
      
    } catch (error) {
      console.error('Build error:', error);
      setLogs(prev => [...prev, 'Error building preview', String(error)]);
    } finally {
      setIsBuilding(false);
    }
  };
  
  useEffect(() => {
    buildPreview();
  }, [files]); // Rebuild when files change
  
  const renderPreviewContent = () => {
    if (isBuilding) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-900">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          </div>
          <p className="mt-4 text-gray-400">Building preview...</p>
          <p className="text-sm text-gray-500 mt-2">{stack.frontend.toUpperCase()} + {stack.backend}</p>
        </div>
      );
    }
    
    if (previewUrl) {
      return (
        <div className="h-full flex flex-col">
          {/* Preview Header */}
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={buildPreview}
                className="p-1.5 hover:bg-gray-800 rounded"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-800 rounded"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Preview Content */}
          <div className="flex-1 bg-white">
            <div className="w-full h-full border-4 border-gray-200 rounded-lg overflow-hidden">
              {/* Mock browser */}
              <div className="bg-gray-100 border-b p-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-gray-200 px-3 py-1 rounded text-xs">
                  {previewUrl}
                </div>
              </div>
              
              {/* Mock website content */}
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-8">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-gray-100 rounded"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gray-50 rounded-lg border">
                      <div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded"></div>
                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 rounded-lg border">
                      <div className="h-6 w-36 bg-gray-200 rounded mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded"></div>
                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="h-6 w-40 bg-blue-200 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-blue-100 rounded"></div>
                      <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-3" />
        <p className="text-gray-400">Preview not available</p>
        <button
          onClick={buildPreview}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
          Build Preview
        </button>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isBuilding ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
          <span className="text-sm font-medium">Live Preview</span>
          <span className="text-xs px-2 py-0.5 bg-gray-800 rounded">
            {stack.frontend.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={buildPreview}
            disabled={isBuilding}
            className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50"
          >
            {isBuilding ? 'Building...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {/* Preview Container */}
      <div className="flex-1 overflow-auto">
        {renderPreviewContent()}
      </div>
      
      {/* Logs Panel (Collapsed by default) */}
      <div className="border-t border-gray-800">
        <details>
          <summary className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-800/50">
            Build Logs ({logs.length})
          </summary>
          <div className="h-32 overflow-y-auto bg-black p-3 font-mono text-xs">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-400 mb-1">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
