'use client';

import React from 'react';
import { useProjectStore } from '../state/project-store';

export function FileContextMenu({ file }: { file: string }) {
  const { deleteFile } = useProjectStore();

  const handleDelete = () => {
    if (confirm(`Delete ${file}?`)) {
      deleteFile(file);
    }
  };

  return (
    <div className="flex gap-2 mt-1">
      <button onClick={handleDelete} className="text-red-500 text-sm hover:underline">Delete</button>
    </div>
  );
}
