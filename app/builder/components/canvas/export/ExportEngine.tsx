"use client";

import { useState } from 'react';
import { Download, FileCode, Folder, Package, Server, Database } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function ExportEngine() {
  const { name, stack, files } = useProjectStore();
  const [exportFormat, setExportFormat] = useState<'zip' | 'github' | 'vercel'>('zip');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Project "${name}" exported successfully!`);
      
      // In a real implementation, you would:
      // 1. Create ZIP file with all files
      // 2. Push to GitHub repository
      // 3. Deploy to Vercel
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getPackageJson = () => {
    const dependencies: Record<string, string> = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'next': '^14.0.0',
      ...(stack.frontend === 'nextjs' ? { 'next': '^14.0.0' } : {}),
      ...(stack.backend === 'node' ? { 'express': '^4.18.0' } : {}),
      ...(stack.backend === 'python' ? { 'flask': '^2.3.0' } : {}),
      ...(stack.database === 'postgresql' ? { 'pg': '^8.11.0' } : {}),
      ...(stack.database === 'mongodb' ? { 'mongoose': '^7.5.0' } : {}),
    };

    return JSON.stringify({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies,
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'autoprefixer': '^10.4.0',
        'eslint': '^8.0.0',
        'eslint-config-next': '^14.0.0',
        'postcss': '^8.4.0',
        'tailwindcss': '^3.3.0',
        'typescript': '^5.0.0'
      }
    }, null, 2);
  };

  const getRequirementsTxt = () => {
    if (stack.backend !== 'python') return '';
    
    return `flask==2.3.0
${stack.database === 'postgresql' ? 'psycopg2-binary==2.9.9' : ''}
${stack.database === 'mongodb' ? 'pymongo==4.5.0' : ''}`;
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
          className={`p-4 rounded-lg border-2 flex flex-col items-center ${exportFormat === 'zip' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}
        >
          <Download className="w-8 h-8 mb-2" />
          <span className="font-medium">Download ZIP</span>
          <span className="text-xs text-gray-400">Local development</span>
        </button>
        
        <button
          onClick={() => setExportFormat('github')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center ${exportFormat === 'github' ? 'border-green-500 bg-green-500/10' : 'border-gray-700 hover:border-gray-600'}`}
        >
          <FileCode className="w-8 h-8 mb-2" />
          <span className="font-medium">Push to GitHub</span>
          <span className="text-xs text-gray-400">Version control</span>
        </button>
        
        <button
          onClick={() => setExportFormat('vercel')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center ${exportFormat === 'vercel' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-600'}`}
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
              <div className="text-xs text-gray-400 capitalize">{stack.frontend}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded">
            <Server className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm font-medium">Backend</div>
              <div className="text-xs text-gray-400 capitalize">{stack.backend}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded">
            <Database className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-sm font-medium">Database</div>
              <div className="text-xs text-gray-400 capitalize">{stack.database}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded">
            <Folder className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-sm font-medium">Files</div>
              <div className="text-xs text-gray-400">{Object.keys(files).length} files</div>
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
