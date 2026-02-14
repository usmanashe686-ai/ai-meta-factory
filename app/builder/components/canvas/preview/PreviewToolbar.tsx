'use client';

import { useState } from 'react';
import { useBuildService } from '../hooks/useBuildService';
import { BuildStatusPanel } from '../toolbar/BuildStatusPanel';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface PreviewToolbarProps {
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  showLogs: boolean;
  onToggleLogs: () => void;
}

export function PreviewToolbar({ device, onDeviceChange, showLogs, onToggleLogs }: PreviewToolbarProps) {
  const [showBuildPanel, setShowBuildPanel] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { triggerBuild, buildStatus, isLoading } = useBuildService();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleBuild = () => {
    setShowBuildPanel(true);
    triggerBuild('flutter');
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {/* Device buttons */}
          <button onClick={() => onDeviceChange('desktop')} className={`p-2 rounded ${device === 'desktop' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`} title="Desktop">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => onDeviceChange('tablet')} className={`p-2 rounded ${device === 'tablet' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`} title="Tablet">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => onDeviceChange('mobile')} className={`p-2 rounded ${device === 'mobile' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`} title="Mobile">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleBuild} className="p-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700" title="Build APK">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 3v9a1 1 0 01-1 1h-4a1 1 0 01-1-1V7L8 4z" /></svg>
          </button>
          <button onClick={handleRefresh} className="p-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700" title="Refresh preview">
            <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700" title="Open in new tab">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </button>
          <button onClick={onToggleLogs} className={`p-2 rounded ${showLogs ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`} title="Toggle logs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
      {showBuildPanel && (
        <BuildStatusPanel status={buildStatus} isLoading={isLoading} onClose={() => setShowBuildPanel(false)} />
      )}
    </>
  );
}
