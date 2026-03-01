import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { UniversalExporter, ProjectFile } from './UniversalExporter';
import { useProjectStore } from '../state/project-store';
import { apiFetch } from "@/lib/apiClient";

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
  const [vercelToken, setVercelToken] = useState('');
  const [vercelProjectId, setVercelProjectId] = useState('');
  const [buildServerUrl, setBuildServerUrl] = useState(process.env.NEXT_PUBLIC_BUILD_SERVICE_URL || '/api/build');

  const files = useProjectStore((state) => state.files);
  const project = useProjectStore((state) => state.project);
  const envVars = useProjectStore((state) => state.envVars);

  if (!isOpen) return null;

  const projectName = project?.name || 'project';

  // Helper to collect files
  const getProjectFiles = (): ProjectFile[] => {
    const projectFiles: ProjectFile[] = [];
    const collectFiles = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.type === 'file' && node.content !== undefined) {
          projectFiles.push({
            path: node.path,
            content: node.content,
          });
        }
        if (node.children) {
          collectFiles(node.children);
        }
      }
    };
    collectFiles(files);
    return projectFiles;
  };

  // Create a ZIP blob with project files + .env
  const createProjectZip = async (includeEnv = true): Promise<Blob> => {
    const projectFiles = getProjectFiles();
    const zip = new JSZip();
    projectFiles.forEach(file => zip.file(file.path, file.content));
    if (includeEnv && Object.keys(envVars).length > 0) {
      const envContent = Object.entries(envVars)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');
      zip.file('.env', envContent);
    }
    return await zip.generateAsync({ type: 'blob' });
  };

  const handleExport = async () => {
    if (!files || files.length === 0) return;

    setIsExporting(true);
    try {
      switch (format) {
        case 'zip':
          await handleZipExport();
          break;
        case 'apk':
          await handleApkExport();
          break;
        case 'github':
          await handleGitHubExport();
          break;
        case 'vercel':
          await handleVercelDeploy();
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

  const handleZipExport = async () => {
    const projectFiles = getProjectFiles();
    if (Object.keys(envVars).length > 0) {
      const envContent = Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      projectFiles.push({ path: '.env', content: envContent });
    }
    await UniversalExporter.exportProject(projectFiles, `${projectName}.zip`);
  };

  const handleApkExport = async () => {
    const zipBlob = await createProjectZip(true);
    const formData = new FormData();
    formData.append('project', zipBlob, `${projectName}.zip`);
    formData.append('appName', projectName);
    formData.append('packageName', `com.aimetafactory.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
    formData.append('version', '1.0.0');
    // Include env vars as a JSON string in the request (or they are inside the zip)
    const response = await fetch(`${buildServerUrl}/apk`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error(`Build failed: ${await response.text()}`);
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/octet-stream')) {
      const blob = await response.blob();
      saveAs(blob, `${projectName}.apk`);
    } else {
      const { jobId } = await response.json();
      await pollBuildStatus(jobId);
    }
  };

  const handleGitHubExport = async () => {
    if (!repoName || !githubToken) {
      alert('Please enter repository name and GitHub token');
      return;
    }
    const zipBlob = await createProjectZip(true);
    const formData = new FormData();
    formData.append('project', zipBlob, `${projectName}.zip`);
    formData.append('repo', repoName);
    formData.append('token', githubToken);
    formData.append('commitMessage', `Export from AI Meta Factory – ${new Date().toISOString()}`);

    const response = await apiFetch('/api/github/export', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error(`GitHub export failed: ${await response.text()}`);
    const data = await response.json();
    alert(`✅ Repository created: ${data.repoUrl}`);
  };

  const handleVercelDeploy = async () => {
    // Vercel token and project ID can come from the form or from envVars
    const token = vercelToken || envVars.VERCEL_TOKEN;
    const projectId = vercelProjectId || envVars.VERCEL_PROJECT_ID;
    if (!token || !projectId) {
      alert('Please provide Vercel token and project ID (either in the form or as environment variables VERCEL_TOKEN and VERCEL_PROJECT_ID)');
      return;
    }
    const zipBlob = await createProjectZip(true);
    const formData = new FormData();
    formData.append('project', zipBlob, `${projectName}.zip`);
    formData.append('token', token);
    formData.append('projectId', projectId);
    if (envVars) {
      // Optionally send env vars as JSON for Vercel to set as environment variables
      formData.append('envVars', JSON.stringify(envVars));
    }

    const response = await apiFetch('/api/vercel/deploy', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error(`Vercel deploy failed: ${await response.text()}`);
    const data = await response.json();
    alert(`✅ Deployed to Vercel: ${data.deploymentUrl}`);
  };

  const pollBuildStatus = async (jobId: string) => {
    const maxAttempts = 60;
    const interval = 2000;
    for (let i = 0; i < maxAttempts; i++) {
      const res = await fetch(`${buildServerUrl}/status/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'completed') {
          const downloadRes = await fetch(`${buildServerUrl}/download/${jobId}`);
          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            saveAs(blob, `${projectName}.apk`);
          } else {
            throw new Error('Failed to download APK');
          }
          return;
        } else if (data.status === 'failed') {
          throw new Error(data.error || 'Build failed');
        }
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Build timed out');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 text-white max-h-[80vh] overflow-y-auto">
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
                <p className="text-xs text-gray-400 mt-1">Requires `repo` scope.</p>
              </div>
            </>
          )}

          {format === 'vercel' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Vercel Token</label>
                <input
                  type="password"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vercel Project ID</label>
                <input
                  type="text"
                  value={vercelProjectId}
                  onChange={(e) => setVercelProjectId(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
                <p className="text-xs text-gray-400 mt-1">You can also set VERCEL_TOKEN and VERCEL_PROJECT_ID as environment variables in the project.</p>
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
