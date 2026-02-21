'use client';

import { useCallback } from 'react';

interface ExportEvent {
  projectId?: string;
  projectName?: string;
  format: string;
  platform?: string;
  status: 'success' | 'failed';
  error?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export const useExportAnalytics = () => {
  const trackExport = useCallback(async (event: ExportEvent) => {
    try {
      const res = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!res.ok) {
        console.error('Failed to track export:', await res.text());
      }
    } catch (err) {
      console.error('Error tracking export:', err);
    }
  }, []);

  return { trackExport };
};

export default useExportAnalytics;
