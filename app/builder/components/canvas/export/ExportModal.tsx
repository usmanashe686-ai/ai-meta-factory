import React, { useState } from 'react';
import { UniversalExporter, ProjectFile } from './UniversalExporter';
import { useProjectStore } from '../state/project-store';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'zip' | 'apk' | 'github' | 'vercel';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<ExportFormat>('zip');
  const [isExporting, setIsExporting] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const { project } = useProjectStore();

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!project) return;

    setIsExporting(true);
    try {
      // Convert project files to ProjectFile array
      const files: ProjectFile[] = Object.entries(project.files || {}).map(([path, content]) => ({
        path,
        content,
      }));

      switch (format) {
        case 'zip':
          await UniversalExporter.exportProject(files, `${project.name || 'project'}.zip`);
          break;
        case 'apk':
          // This would trigger APK build via backend
          alert('APK export requires backend build service. Coming soon!');
          break;
        case 'github':
          // Placeholder
          alert('GitHub export not implemented yet.');
          break;
        case 'vercel':
          alert('Vercel deployment not implemented yet.');
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 text-white">
        <h2 className="text-xl font-bold mb-4">Export Project</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            >
              <option value="zip">ZIP Archive</option>
              <option value="apk">APK (Android App)</option>
              <option value="github">GitHub Repository</option>
              <option value="vercel">Vercel Deployment</option>
            </select>
          </div>

          {format === 'github' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Repository Name (user/repo)</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  placeholder="e.g., username/myapp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub Token</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
            </>
          )}

          {format === 'apk' && (
            <p className="text-sm text-yellow-400">
              APK export will send your project to the build server. Make sure the server is running.
            </p>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
