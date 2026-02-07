'use client';

import React from 'react';
import { useProjectStore } from '../state/project-store';
import classNames from 'classnames';

export function EditorTabs() {
  const { files, activeFile, setActiveFile } = useProjectStore();
  const fileKeys = Object.keys(files);

  if (fileKeys.length === 0) return null;

  return (
    <div className="flex bg-gray-800 border-b border-gray-700">
      {fileKeys.map((file) => (
        <button
          key={file}
          className={classNames(
            'px-4 py-2 text-sm font-medium border-r border-gray-700',
            activeFile === file
              ? 'bg-gray-900 text-white'
              : 'text-gray-400 hover:bg-gray-700'
          )}
          onClick={() => setActiveFile(file)}
        >
          {file.split('/').pop()}
        </button>
      ))}
    </div>
  );
}
