'use client';

import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  type: 'info' | 'warn' | 'error' | 'log';
  message: string;
  timestamp: number;
}

// This would normally come from a store or WebSocket connection
// For now, we'll use a simple mock
export function PreviewLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Mock adding logs – in real app, connect to preview iframe console
  useEffect(() => {
    const interval = setInterval(() => {
      // This is just for demo; you'd capture actual console logs from the preview
      // via a custom Sandpack listener or iframe message passing
      setLogs(prev => [
        ...prev,
        {
          type: 'log',
          message: `[${new Date().toLocaleTimeString()}] Application rendered`,
          timestamp: Date.now()
        }
      ].slice(-50)); // keep last 50 logs
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => setLogs([]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Console Logs</h3>
        <button
          onClick={clearLogs}
          className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-200 rounded dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-400 italic p-2">No logs yet...</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`py-1 border-b border-gray-100 dark:border-gray-800 ${
                log.type === 'error' ? 'text-red-600 dark:text-red-400' :
                log.type === 'warn' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-gray-800 dark:text-gray-200'
              }`}
            >
              <span className="text-gray-400 mr-2">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
