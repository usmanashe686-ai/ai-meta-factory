'use client';

import { useState, useEffect } from 'react';
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react';
import { useProjectStore } from '../state/project-store';
import { PreviewToolbar } from './PreviewToolbar';
import { DeviceEmulator, DeviceType } from './DeviceEmulator';
import { PreviewLogs, LogEntry } from './PreviewLogs';
import { useSandpack } from '@codesandbox/sandpack-react';

// Listener component that captures console logs from the sandbox
function SandpackLogListener({ onLog }: { onLog: (log: LogEntry) => void }) {
  const { listen } = useSandpack();

  useEffect(() => {
    const stopListening = listen((msg) => {
      if (msg.type === 'console' && Array.isArray(msg.log)) {
        msg.log.forEach((logItem: any) => {
          let type: LogEntry['type'] = 'log';
          if (logItem.method === 'warn') type = 'warn';
          if (logItem.method === 'error') type = 'error';
          if (logItem.method === 'info') type = 'info';
          onLog({
            type,
            message: logItem.data.join(' '),
            timestamp: Date.now(),
          });
        });
      }
    });
    return () => stopListening();
  }, [listen, onLog]);

  return null;
}

interface UniversalPreviewProps {
  showLogsByDefault?: boolean;
}

export function UniversalPreview({ showLogsByDefault = false }: UniversalPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [showLogs, setShowLogs] = useState(showLogsByDefault);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { files, activeFile } = useProjectStore();

  const sandpackFiles = files.reduce((acc, file) => {
    const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
    acc[path] = { code: file.content ?? '' };
    return acc;
  }, {} as Record<string, { code: string }>);

  const handleLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log].slice(-50));
  };

  const clearLogs = () => setLogs([]);

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
          <SandpackProvider
            template={template}
            files={sandpackFiles}
            options={{
              activeFile: activeFile ?? undefined,
              autorun: true,
              classes: {
                'sp-preview': 'h-full w-full',
              },
              preview: {
                showNavigator: true,
                showRefreshButton: true,
                wrapContent: true,
              },
              editorHeight: '100%',
              editorWidthPercentage: 0, // Hide editor since we only want preview
            }}
            customSetup={{
              dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
              },
            }}
          >
            <DeviceEmulator device={device}>
              <SandpackPreview />
            </DeviceEmulator>
            <SandpackLogListener onLog={handleLog} />
          </SandpackProvider>
        </div>
        {showLogs && (
          <div className="h-64 border-t border-gray-300 dark:border-gray-700">
            <PreviewLogs logs={logs} onClear={clearLogs} />
          </div>
        )}
      </div>
    </div>
  );
}
