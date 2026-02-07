'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../state/project-store';

export function FileSearch() {
  const { files, setActiveFile } = useProjectStore();
  const [query, setQuery] = useState('');

  const filtered = Object.keys(files).filter(f => f.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-2">
      <input
        className="w-full p-1 bg-gray-800 rounded border border-gray-700 text-sm"
        placeholder="Search files..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="mt-2 space-y-1">
        {filtered.map(f => (
          <div
            key={f}
            className="px-2 py-1 hover:bg-gray-700 rounded cursor-pointer"
            onClick={() => setActiveFile(f)}
          >
            {f.split('/').pop()}
          </div>
        ))}
      </div>
    </div>
  );
}
