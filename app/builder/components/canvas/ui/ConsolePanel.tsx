"use client";

import { Terminal, X } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function ConsolePanel() {
  const { consoleOutput } = useProjectStore();
  
  const clearConsole = () => {
    // Clear console logic here
    console.log('Console cleared');
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 border-t border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between bg-gray-900/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-medium">Console</span>
        </div>
        <button
          onClick={clearConsole}
          className="text-xs text-gray-400 hover:text-white"
        >
          Clear
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {consoleOutput.length > 0 ? (
          consoleOutput.map((line, index) => (
            <div key={index} className="mb-1">
              <span className="text-green-400">$</span>
              <span className="ml-2 text-gray-300">{line}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic">Console output will appear here...</div>
        )}
      </div>
    </div>
  );
}
