'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { SandpackProvider, SandpackLayout, SandpackPreview as SandpackPreviewComponent } from '@codesandbox/sandpack-react';
import { useProjectStore } from '../state/project-store';
import '@codesandbox/sandpack-react/dist/index.css';

// Error boundary to catch render errors
class ErrorBoundary extends React.Component<{children: React.ReactNode, fallback: React.ReactNode, onError?: () => void}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('Sandpack error:', error, errorInfo);
    this.props.onError?.();
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function SandpackPreview() {
  const { files, activeFileId } = useProjectStore();
  const [sandpackError, setSandpackError] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const [fallbackHtml, setFallbackHtml] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // Convert files to Sandpack format
  const sandpackFiles = useMemo(() => {
    const fileNodes = files.filter(f => f.type === 'file' && f.content !== undefined);
    return fileNodes.reduce((acc, file) => {
      const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
      acc[path] = { code: file.content ?? '' };
      return acc;
    }, {} as Record<string, { code: string }>);
  }, [files]);

  // Generate fallback HTML from the code
  useEffect(() => {
    const htmlFile = Object.keys(sandpackFiles).find(f => f.endsWith('.html'));
    if (htmlFile) {
      setFallbackHtml(sandpackFiles[htmlFile].code);
    } else {
      // Create a basic HTML that displays all code files
      const allCode = Object.entries(sandpackFiles)
        .map(([path, { code }]) => `// ${path}\n${code}`)
        .join('\n\n');
      setFallbackHtml(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview (Fallback)</title>
  <style>body { font-family: monospace; white-space: pre; padding: 1rem; background: #1e1e1e; color: #d4d4d4; }</style>
</head>
<body>
  <h3>⚠️ Live preview unavailable – showing code</h3>
  <pre>${allCode.replace(/</g, '&lt;')}</pre>
</body>
</html>
      `);
    }
  }, [sandpackFiles]);

  // Timeout detection: if Sandpack takes more than 5 seconds, show fallback
  useEffect(() => {
    if (!sandpackError && !timeoutError) {
      const timer = setTimeout(() => {
        setTimeoutError(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sandpackError, timeoutError]);

  const handleRetry = useCallback(() => {
    setSandpackError(false);
    setTimeoutError(false);
    setRetryKey(prev => prev + 1);
  }, []);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No files to preview
      </div>
    );
  }

  const fallback = (
    <div className="h-full flex flex-col">
      <div className="bg-yellow-600 text-white p-2 text-sm flex justify-between items-center">
        <span>⚠️ Preview unavailable – showing fallback.</span>
        <button
          onClick={handleRetry}
          className="px-2 py-1 bg-yellow-700 rounded text-xs hover:bg-yellow-800"
        >
          Retry
        </button>
      </div>
      <iframe
        key={retryKey}
        srcDoc={fallbackHtml}
        className="w-full flex-1 bg-white"
        sandbox="allow-scripts allow-same-origin"
        title="Fallback preview"
      />
    </div>
  );

  return (
    <div className="h-full w-full border-l border-gray-200">
      <ErrorBoundary fallback={fallback} onError={() => setSandpackError(true)}>
        {!sandpackError && !timeoutError ? (
          <SandpackProvider
            key={retryKey}
            template="react-ts"
            files={sandpackFiles}
            customSetup={{
              dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
              },
              entry: "/src/index.tsx",
            }}
            options={{
              autorun: true,
              bundlerURL: undefined, // Ensure default cloud bundler
            }}
          >
            <SandpackLayout>
              <SandpackPreviewComponent
                showNavigator
                showRefreshButton
                className="h-full"
              />
            </SandpackLayout>
          </SandpackProvider>
        ) : (
          fallback
        )}
      </ErrorBoundary>
    </div>
  );
}
