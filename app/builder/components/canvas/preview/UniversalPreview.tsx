'use client';

import { useState, useEffect, useMemo } from 'react';
import { SandpackProvider, SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import { useProjectStore } from '../state/project-store';
import { PreviewToolbar } from './PreviewToolbar';
import { DeviceEmulator, DeviceType } from './DeviceEmulator';
import { PreviewLogs, LogEntry } from './PreviewLogs';

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
            message: Array.isArray(logItem.data)
              ? logItem.data.join(' ')
              : String(logItem.data),
            timestamp: Date.now(),
          });
        });
      }
    });

    return () => stopListening();
  }, [listen, onLog]);

  return null;
}

export function UniversalPreview({ showLogsByDefault = false }: { showLogsByDefault?: boolean }) {
  const [device, setDevice] = useState<DeviceType>('mobile');
  const [showLogs, setShowLogs] = useState(showLogsByDefault);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const { files, addToConsole } = useProjectStore();

  const sandpackFiles = useMemo(() => {
    const fileMap: Record<string, { code: string }> = {};

    files.forEach(file => {
      if (file.type === 'file') {
        const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
        fileMap[path] = { code: file.content || '' };
      }
    });

    // ✅ Ensure App exists
    if (!fileMap['/src/App.tsx'] && !fileMap['/App.tsx']) {
      fileMap['/src/App.tsx'] = {
        code: `
export default function App() {
  return <div style={{padding:20}}>No App.tsx found</div>;
}`
      };
    }

    // ✅ Ensure React entry point exists
    if (!fileMap['/src/index.tsx']) {
      fileMap['/src/index.tsx'] = {
        code: `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
`
      };
    }

    // ✅ Ensure HTML exists
    if (!fileMap['/index.html']) {
      fileMap['/index.html'] = {
        code: `
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
  </body>
</html>
`
      };
    }

    return fileMap;
  }, [files]);

  const handleLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log].slice(-50));

    if (log.type === 'error') {
      addToConsole({
        type: 'error',
        message: '[Preview] ' + log.message
      });
    }
  };

  if (Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No files to preview
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      <PreviewToolbar
        device={device}
        onDeviceChange={setDevice}
        onToggleLogs={() => setShowLogs(!showLogs)}
        showLogs={showLogs}
      />

      <div className="flex-1 relative">
        <SandpackProvider
          template="react-ts"
          files={sandpackFiles}
          options={{
            autorun: true,
            recompileMode: "immediate",
            initMode: "immediate"
          }}
          customSetup={{
            dependencies: {
              "react": "^18.2.0",
              "react-dom": "^18.2.0",
              "lucide-react": "latest",
              "framer-motion": "latest"
            }
          }}
        >
          <DeviceEmulator device={device}>
            <SandpackPreview style={{ height: '100%' }} />
          </DeviceEmulator>

          <SandpackLogListener onLog={handleLog} />
        </SandpackProvider>

        {showLogs && (
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black border-t border-gray-700">
            <PreviewLogs logs={logs} onClear={() => setLogs([])} />
          </div>
        )}
      </div>
    </div>
  );
}
