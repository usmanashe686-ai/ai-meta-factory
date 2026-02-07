'use client';

import React from 'react';
import { usePreviewStore } from '../state/preview-store';
import { Trash2 } from 'lucide-react';

export function ConsolePanel() {
  const { consoleOutput, clearConsole } = usePreviewStore();

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-2 text-sm flex flex-col h-40 overflow-auto">
      <div className="flex justify-between items-center mb-1">
        <span>Console</span>
        <button onClick={clearConsole} className="hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {consoleOutput.map((line, i) => (
          <div key={i} className="font-mono text-gray-300">{line}</div>
        ))}
      </div>
    </div>
  );
}
