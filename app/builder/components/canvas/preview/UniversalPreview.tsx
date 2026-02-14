'use client';

import { useState } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { useProjectStore } from '../state/project-store';
import { PreviewToolbar } from './PreviewToolbar';
import { DeviceEmulator, DeviceType } from './DeviceEmulator';
import { PreviewLogs } from './PreviewLogs';

interface UniversalPreviewProps {
  showLogsByDefault?: boolean;
}

export function UniversalPreview({ showLogsByDefault = false }: UniversalPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [showLogs, setShowLogs] = useState(showLogsByDefault);
  const { files, activeFile } = useProjectStore();

  // Convert project files to Sandpack format
  const sandpackFiles = files.reduce((acc, file) => {
    const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
    acc[path] = { code: file.content };
    return acc;
  }, {} as Record<string, { code: string }>);

  // Default template – can be made dynamic later
  const template = 'react-ts';

  if (files.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        No files to preview
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-100 dark:bg-gray-900">
      <PreviewToolbar
        device={device}
        onDeviceChange={setDevice}
        onToggleLogs={() => setShowLogs(!showLogs)}
        showLogs={showLogs}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1">
          <DeviceEmulator device={device}>
            <Sandpack
              template={template}
              files={sandpackFiles}
              options={{
                showNavigator: true,
                showTabs: true,
                editorHeight: '100%',
                activeFile: activeFile?.path,
                wrapContent: true,
                autorun: true,
              }}
              theme="auto"
              customSetup={{
                dependencies: {
                  "react": "^18.2.0",
                  "react-dom": "^18.2.0",
                },
              }}
            />
          </DeviceEmulator>
        </div>
        {showLogs && (
          <div className="h-64 border-t border-gray-300 dark:border-gray-700">
            <PreviewLogs />
          </div>
        )}
      </div>
    </div>
  );
}
