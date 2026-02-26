'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { useProjectStore } from '../state/project-store';
import { useMemo, useState, useEffect } from 'react';
import '@codesandbox/sandpack-react/dist/index.css';

export function SandpackPreview() {
  const { files, activeFileId } = useProjectStore();
  const [sandpackError, setSandpackError] = useState(false);
  const [fallbackHtml, setFallbackHtml] = useState('');

  const sandpackFiles = useMemo(() => {
    const fileNodes = files.filter(f => f.type === 'file' && f.content !== undefined);
    return fileNodes.reduce((acc, file) => {
      const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
      acc[path] = { code: file.content ?? '' };
      return acc;
    }, {} as Record<string, { code: string }>);
  }, [files]);

  // Generate a simple HTML preview for fallback
  useEffect(() => {
    // Try to find an HTML file, otherwise generate a simple page
    const htmlFile = Object.keys(sandpackFiles).find(f => f.endsWith('.html'));
    if (htmlFile) {
      setFallbackHtml(sandpackFiles[htmlFile].code);
    } else {
      // Create a basic HTML that includes the code
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

  const template = 'react-ts';

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No files to preview
      </div>
    );
  }

  return (
    <div className="h-full w-full border-l border-gray-200">
      {!sandpackError ? (
        <Sandpack
          template={template}
          files={sandpackFiles}
          options={{
            showNavigator: true,
            showTabs: true,
            editorHeight: '100%',
            activeFile: activeFileId && sandpackFiles[activeFileId] ? activeFileId : undefined,
            wrapContent: true,
            autorun: true,
            externalResources: [],
          }}
          theme="auto"
          customSetup={{
            dependencies: {
              "react": "^18.2.0",
              "react-dom": "^18.2.0",
            },
            entry: "/src/index.tsx",
          }}
          onError={() => setSandpackError(true)}
        />
      ) : (
        <div className="h-full flex flex-col">
          <div className="bg-yellow-600 text-white p-2 text-sm">
            ⚠️ Cloud preview unavailable – showing fallback preview.
          </div>
          <iframe
            srcDoc={fallbackHtml}
            className="w-full flex-1 bg-white"
            sandbox="allow-scripts allow-same-origin"
            title="Fallback preview"
          />
        </div>
      )}
    </div>
  );
}
