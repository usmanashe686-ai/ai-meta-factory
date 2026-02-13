import { useState, useCallback } from 'react';
import { useProjectStore } from '../state/project-store';

const BUILD_SERVICE_URL = process.env.NEXT_PUBLIC_BUILD_SERVICE_URL || 'http://localhost:8080';

export interface BuildStatus {
  buildId: string;
  status: 'queued' | 'building' | 'completed' | 'failed';
  downloadUrl?: string;
  error?: string;
}

export function useBuildService() {
  const [isLoading, setIsLoading] = useState(false);
  const [buildStatus, setBuildStatus] = useState<BuildStatus | null>(null);
  const { files } = useProjectStore();

  const triggerBuild = useCallback(async (platform: string) => {
    setIsLoading(true);
    setBuildStatus(null);

    try {
      // Prepare files in the format expected by build service
      const filesMap: Record<string, string> = {};
      files.forEach(file => {
        filesMap[file.path] = file.content;
      });

      const response = await fetch(`${BUILD_SERVICE_URL}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'test-project', // In real app, use actual project ID
          platform,
          files: filesMap,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger build');
      }

      const data = await response.json();
      const buildId = data.build_id;

      setBuildStatus({ buildId, status: 'queued' });

      // Start polling for status
      pollBuildStatus(buildId);
    } catch (error) {
      setBuildStatus({ buildId: '', status: 'failed', error: error.message });
      setIsLoading(false);
    }
  }, [files]);

  const pollBuildStatus = useCallback(async (buildId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`${BUILD_SERVICE_URL}/build/status?id=${buildId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        const status = data.status as BuildStatus['status'];
        const downloadUrl = data.downloadURL;

        setBuildStatus({ buildId, status, downloadUrl });

        if (status === 'completed' || status === 'failed') {
          setIsLoading(false);
          return true; // stop polling
        }
        return false; // continue polling
      } catch (error) {
        setBuildStatus({ buildId, status: 'failed', error: error.message });
        setIsLoading(false);
        return true;
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const shouldStop = await poll();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 2000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return { triggerBuild, buildStatus, isLoading };
}
