'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {   
  SandpackProvider,   
  SandpackPreview,   
  SandpackLayout,  
  useSandpack  
} from '@codesandbox/sandpack-react';
import { sandpackDark } from '@codesandbox/sandpack-themes';
import { useProjectStore } from '../state/project-store';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const convertToSandpackFiles = (projectFiles: Record<string, any>) => {
  const sandpackFiles: Record<string, { code: string }> = {};
  Object.entries(projectFiles).forEach(([path, file]) => {
    if (path.includes('node_modules') || path.startsWith('.')) return;
    sandpackFiles[path] = { code: file.content };
  });
  if (!sandpackFiles['/App.js'] && Object.keys(sandpackFiles).length > 0) {
    const firstFile = Object.keys(sandpackFiles)[0];
    sandpackFiles['/App.js'] = { code: `// Importing: ${firstFile}\n${sandpackFiles[firstFile].code}` };
  }
  return sandpackFiles;
};

function PreviewLoader() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-400">Loading preview environment...</p>
    </div>
  );
}

function PreviewError({ error }: { error: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-red-900/20 p-6">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <pre className="bg-black/50 p-4 rounded-lg text-sm text-red-300 whitespace-pre-wrap">{error}</pre>
      <button
        className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
        onClick={() => window.location.reload()}
      >
        <RefreshCw size={16} /> Reload Preview
      </button>
    </div>
  );
}

function PreviewStatusBar() {
  const { sandpack } = useSandpack();
  const { activeFile, status } = sandpack;
  const statusColors = { 'idle': 'bg-gray-500', 'running': 'bg-blue-500', 'success': 'bg-green-500', 'error': 'bg-red-500' };

  return (
    <div className="border-t border-gray-800 bg-gray-900 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-gray-500'} animate-pulse`}></div>
          <span className="text-gray-300 capitalize">{status}</span>
        </div>
        {activeFile && <div className="text-gray-400">Active: <span className="font-mono">{activeFile.split('/').pop()}</span></div>}
      </div>
      <div className="flex items-center gap-4">
        <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs flex items-center gap-1" onClick={() => sandpack.runSandpack()}>
          <RefreshCw size={12} /> Refresh
        </button>
        <a href={`https://${sandpack.sandpackId}.csb.app`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs flex items-center gap-1">
          <ExternalLink size={12} /> Open in New Tab
        </a>
      </div>
    </div>
  );
}

export function PreviewEngine() {
  const { files, stack } = useProjectStore();
  const [sandpackFiles, setSandpackFiles] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      setSandpackFiles(convertToSandpackFiles(files));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  }, [files, refreshKey]);

  const getTemplate = () => {
    const s = stack.toLowerCase();
    if (s.includes('next')) return 'nextjs';
    if (s.includes('vue')) return 'vue';
    if (s.includes('react')) return 'react';
    return 'react';
  };

  const handleRefresh = useCallback(() => setRefreshKey(prev => prev + 1), []);

  if (Object.keys(files).length === 0) return <div className="h-full w-full flex items-center justify-center text-gray-400">Create a file to see preview</div>;
  if (isLoading) return <PreviewLoader />;
  if (error) return <PreviewError error={error} />;

  return (
    <div className="h-full w-full flex flex-col bg-gray-950 border-l border-gray-800">
      <div className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Live Preview</h3>
          <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded">{getTemplate().toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3 h-3 cursor-pointer hover:text-white" onClick={handleRefresh} /> Refresh
          </div>
          <div>{Object.keys(sandpackFiles).length} file{Object.keys(sandpackFiles).length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <SandpackProvider key={refreshKey} template={getTemplate()} theme={sandpackDark} files={sandpackFiles} options={{ autorun: true }}>
          <SandpackLayout>
            <SandpackPreview style={{ height: '100%', width: '100%' }} />
          </SandpackLayout>
          <PreviewStatusBar />
        </SandpackProvider>
      </div>
    </div>
  );
}
// Add console capture
useEffect(() => {
  const originalLog = console.log;
  console.log = (...args) => {
    usePreviewStore.getState().addConsoleOutput(args.join(' '));
    originalLog(...args);
  };
  return () => { console.log = originalLog; };
}, []);
