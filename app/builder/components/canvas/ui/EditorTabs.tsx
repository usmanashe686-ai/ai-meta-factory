'use client';

import React from 'react';
import { useProjectStore } from '../state/project-store';
import classNames from 'classnames';

export function EditorTabs() {
  const { files, activeFileId, setActiveFile } = useProjectStore();

  // Filter to only files (no folders)
  const fileNodes = files.filter(f => f.type === 'file');

  if (fileNodes.length === 0) return null;

  return (
    <div className="flex bg-gray-800 border-b border-gray-700">
      {fileNodes.map((file) => (
        <button
          key={file.id}
          className={classNames(
            'px-4 py-2 text-sm font-medium border-r border-gray-700',
            activeFileId === file.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-700'
          )}
          onClick={() => setActiveFile(file.id)}
        >
          {file.name}
        </button>
      ))}
    </div>
  );
}
