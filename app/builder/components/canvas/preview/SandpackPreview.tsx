'use client';

import React, { useState } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
} from '@codesandbox/sandpack-react';
import { RefreshCw, Smartphone, Tablet, Monitor } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import '@codesandbox/sandpack-react/dist/index.css';

export const SandpackPreview: React.FC = () => {
  const [device, setDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [showConsole, setShowConsole] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const files = useProjectStore((state) => state.files);
  const stack = useProjectStore((state) => state.stack);
  
  const sandpackFiles = Object.entries(files).reduce((acc, [path, file]) => {
    acc[path] = {
      code: file.content,
      hidden: path.includes('.keep') || path.includes('.gitignore'),
    };
    return acc;
  }, {} as Record<string, any>);
  
  const getTemplate = () => {
    switch (stack.frontend) {
      case 'nextjs':
        return 'nextjs';
      case 'react':
        return 'react';
      case 'vue':
        return 'vue';
      default:
        return 'react';
    }
  };
  
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };
  
  const getDeviceDimensions = () => {
    switch (device) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };
  
  const { width, height } = getDeviceDimensions();
  
  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-sm">Preview</h3>
          <span className="text-xs px-2 py-1 bg-gray-700 rounded">
            {stack.frontend}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-700 rounded p-1">
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1 rounded ${device === 'mobile' ? 'bg-gray-600' : ''}`}
              title="Mobile"
            >
              <Smartphone size={14} />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1 rounded ${device === 'tablet' ? 'bg-gray-600' : ''}`}
              title="Tablet"
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1 rounded ${device === 'desktop' ? 'bg-gray-600' : ''}`}
              title="Desktop"
            >
              <Monitor size={14} />
            </button>
          </div>
          
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Refresh Preview"
          >
            <RefreshCw size={14} />
          </button>
          
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`px-2 py-1 text-xs rounded ${
              showConsole ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            Console
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          key={refreshKey}
          template={getTemplate()}
          theme="dark"
          files={sandpackFiles}
          options={{
            visibleFiles: Object.keys(files).slice(0, 5),
            activeFile: Object.keys(files)[0],
            recompileMode: "delayed",
            recompileDelay: 500,
          }}
        >
          <SandpackLayout>
            <div className="flex-1 overflow-hidden">
              <div
                className={`p-4 overflow-auto ${device !== 'desktop' ? 'flex items-center justify-center' : ''}`}
                style={{ height: showConsole ? '70%' : '100%' }}
              >
                <div
                  className={`bg-white rounded-lg overflow-hidden shadow-xl ${
                    device !== 'desktop' ? 'border border-gray-300' : ''
                  }`}
                  style={{
                    width: device !== 'desktop' ? width : '100%',
                    height: device !== 'desktop' ? height : '100%',
                  }}
                >
                  <SandpackPreview
                    showRefreshButton={false}
                    showOpenInCodeSandbox={false}
                  />
                </div>
              </div>
              
              {showConsole && (
                <div style={{ height: '30%' }}>
                  <SandpackConsole />
                </div>
              )}
            </div>
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
};
