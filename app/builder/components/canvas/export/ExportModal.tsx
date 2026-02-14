'use client';

import React, { useState } from 'react';
import { X, Download, Github, Cloud, Zap, Check, Copy } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';

// Helper to count files (excluding folders) in the tree
const countFiles = (nodes: FileNode[]): number => {
  return nodes.reduce((acc, node) => {
    if (node.type === 'file') return acc + 1;
    if (node.children) return acc + countFiles(node.children);
    return acc;
  }, 0);
};

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const [exportType, setExportType] = useState<'zip' | 'github' | 'vercel'>('zip');
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const projectName = useProjectStore((state) => state.projectName); // fixed
  const stack = useProjectStore((state) => state.stack);
  const files = useProjectStore((state) => state.files);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      switch (exportType) {
        case 'zip':
          await exportAsZip();
          break;
        case 'github':
          await exportToGitHub();
          break;
        case 'vercel':
          await deployToVercel();
          break;
      }

      setTimeout(() => {
        setIsExporting(false);
        alert(`Project exported successfully as ${exportType.toUpperCase()}!`);
        onClose();
      }, 2000);
    } catch (error) {
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  };

  const exportAsZip = async () => {
    const fileCount = countFiles(files);
    console.log(`Exporting ${fileCount} files as ZIP...`);
  };

  const exportToGitHub = async () => {
    console.log('Exporting to GitHub...');
  };

  const deployToVercel = async () => {
    console.log('Deploying to Vercel...');
  };

  const copyProjectSummary = () => {
    const summary = `Project: ${projectName}
Stack: ${stack.frontend} + ${stack.database}
Files: ${countFiles(files)}
Status: Ready for export`;

    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold">Export & Deploy</h2>
            <p className="text-gray-400 text-sm mt-1">
              Export your project or deploy to production
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { id: 'zip', icon: Download, label: 'Download ZIP', desc: 'Complete project files' },
              { id: 'github', icon: Github, label: 'Push to GitHub', desc: 'Create new repository' },
              { id: 'vercel', icon: Cloud, label: 'Deploy to Vercel', desc: 'One-click deployment' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setExportType(option.id as any)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportType === option.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center mb-3">
                  <div className={`p-3 rounded-full ${
                    exportType === option.id
                      ? 'bg-blue-500'
                      : 'bg-gray-800'
                  }`}>
                    <option.icon size={20} />
                  </div>
                </div>
                <h3 className="font-semibold text-center">{option.label}</h3>
                <p className="text-xs text-gray-400 text-center mt-1">{option.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Project Summary</h4>
              <button
                onClick={copyProjectSummary}
                className="flex items-center space-x-1 text-sm px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded"
              >
                {isCopied ? (
                  <>
                    <Check size={14} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Project Name</p>
                <p className="font-medium">{projectName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Stack</p>
                <p className="font-medium">{stack.frontend} + {stack.database}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Files</p>
                <p className="font-medium">{countFiles(files)} files</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="font-medium text-green-400">Ready for export</p>
              </div>
            </div>
          </div>

          {exportType === 'github' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Repository Name</label>
                <input
                  type="text"
                  defaultValue={projectName.toLowerCase().replace(/\s+/g, '-')}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  defaultValue={`${projectName} - Generated with AI Meta Factory`}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="private" defaultChecked />
                <label htmlFor="private" className="text-sm">Private repository</label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Zap size={14} />
              <span>All exports include AI-generated documentation</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-700 hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-lg font-medium flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    {exportType === 'zip' && <Download size={18} />}
                    {exportType === 'github' && <Github size={18} />}
                    {exportType === 'vercel' && <Cloud size={18} />}
                    <span>
                      {exportType === 'zip' && 'Download ZIP'}
                      {exportType === 'github' && 'Push to GitHub'}
                      {exportType === 'vercel' && 'Deploy to Vercel'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
