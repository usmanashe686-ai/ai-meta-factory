'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { useProjectStore } from '../state/project-store';
import { useMemo } from 'react';
import '@codesandbox/sandpack-react/dist/index.css';

export function SandpackPreview() {
  const { files, activeFile } = useProjectStore();

  const sandpackFiles = useMemo(() => {
    return files.reduce((acc, file) => {
      const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
      acc[path] = { code: file.content };
      return acc;
    }, {} as Record<string, { code: string }>);
  }, [files]);

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
      />
    </div>
  );
}
