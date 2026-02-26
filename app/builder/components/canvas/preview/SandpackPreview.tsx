'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { SandpackProvider, SandpackLayout, SandpackPreview as SandpackPreviewComponent } from '@codesandbox/sandpack-react';
import { useProjectStore } from '../state/project-store';
import '@codesandbox/sandpack-react/dist/index.css';

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode, fallback: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
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
  const [fallbackHtml, setFallbackHtml] = useState('');

  const sandpackFiles = useMemo(() => {
    const fileNodes = files.filter(f => f.type === 'file' && f.content !== undefined);
    return fileNodes.reduce((acc, file) => {
      const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
      acc[path] = { code: file.content ?? '' };
      return acc;
    }, {} as Record<string, { code: string }>);
  }, [files]);

  // Generate fallback HTML (used if error boundary triggers)
  useEffect(() => {
    const htmlFile = Object.keys(sandpackFiles).find(f => f.endsWith('.html'));
    if (htmlFile) {
      setFallbackHtml(sandpackFiles[htmlFile].code);
    } else {
      const mainJs = Object.keys(sandpackFiles).find(f => f.endsWith('.tsx') || f.endsWith('.jsx') || f.endsWith('.js'));
      const code = mainJs ? sandpackFiles[mainJs].code : '// No code';
      setFallbackHtml(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <style>body { font-family: sans-serif; padding: 1rem; }</style>
</head>
<body>
  <pre>${code.replace(/</g, '&lt;')}</pre>
</body>
</html>
      `);
    }
  }, [sandpackFiles]);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No files to preview
      </div>
    );
  }

  return (
    <div className="h-full w-full border-l border-gray-200">
      <ErrorBoundary fallback={
        <div className="h-full flex flex-col">
          <div className="bg-yellow-600 text-white p-2 text-sm">
            ⚠️ Preview unavailable – showing fallback.
          </div>
          <iframe
            srcDoc={fallbackHtml}
            className="w-full flex-1 bg-white"
            sandbox="allow-scripts allow-same-origin"
            title="Fallback preview"
          />
        </div>
      }>
        <SandpackProvider
          template="react-ts"
          files={sandpackFiles}
          customSetup={{
            dependencies: {
              "react": "^18.2.0",
              "react-dom": "^18.2.0",
            },
            entry: "/src/index.tsx",
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
      </ErrorBoundary>
    </div>
  );
}
