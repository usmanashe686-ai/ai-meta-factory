"use client";

import { useState } from 'react';
import { Download, FileCode, Folder, Package, Server, Database } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';
import { FileNode } from '../types/project.types';

// Helper to count files (excluding folders) in the tree
const countFiles = (nodes: FileNode[]): number => {
  return nodes.reduce((acc, node) => {
    if (node.type === 'file') return acc + 1;
    if (node.children) return acc + countFiles(node.children);
    return acc;
  }, 0);
};

export function ExportEngine() {
  const project = useProjectStore((state) => state.project);
  const files = useProjectStore((state) => state.files);
  const platform = usePlatformStore((state) => state.platform);
  const stack = usePlatformStore((state) => state.stack);
  const [exportFormat, setExportFormat] = useState<'zip' | 'github' | 'vercel'>('zip');
  const [isExporting, setIsExporting] = useState(false);

  const projectName = project?.name || 'untitled-project';

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Project "${projectName}" exported successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // For the tech stack display, we'll create a simple mapping from platform/stack
  const techStack = {
    frontend: platform === 'web' ? stack : 'react-native',
    backend: 'node', // placeholder
    database: 'none', // placeholder
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Export Project</h2>
        <p className="text-gray-400">Export your project in various formats for deployment.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setExportFormat('zip')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center ${
            exportFormat === 'zip' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <Download className="w-8 h-8 mb-2" />
          <span className="font-medium">Download ZIP</span>
          <span className="text-xs text-gray-400">Local development</span>
        </button>

        <button
          onClick={() => setExportFormat('github')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center ${
            exportFormat === 'github' ? 'border-green-500 bg-green-500/10' : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <FileCode className="w-8 h-8 mb-2" />
          <span className="font-medium">Push to GitHub</span>
          <span className="text-xs text-gray-400">Version control</span>
        </button>

        <button
          onClick={() => setExportFormat('vercel')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center ${
            exportFormat === 'vercel' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <Server className="w-8 h-8 mb-2" />
          <span className="font-medium">Deploy to Vercel</span>
          <span className="text-xs text-gray-400">Instant hosting</span>
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3">Project Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded">
            <Package className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm font-medium">Frontend</div>
              <div className="text-xs text-gray-400 capitalize">{techStack.frontend}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded">
            <Server className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm font-medium">Backend</div>
              <div className="text-xs text-gray-400 capitalize">{techStack.backend}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded">
            <Database className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-sm font-medium">Database</div>
              <div className="text-xs text-gray-400 capitalize">{techStack.database}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded">
            <Folder className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-sm font-medium">Files</div>
              <div className="text-xs text-gray-400">{countFiles(files)} files</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {exportFormat === 'zip' && 'Download a ZIP file with all project files'}
          {exportFormat === 'github' && 'Push to a new GitHub repository'}
          {exportFormat === 'vercel' && 'Deploy instantly to Vercel with zero config'}
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Project
            </>
          )}
        </button>
      </div>
    </div>
  );
}
