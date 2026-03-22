'use client';

import React from 'react';
import { diffLines, Change } from 'diff';

interface DiffViewerProps {
  original: string;
  modified: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified }) => {
  const diff = diffLines(original, modified);

  return (
    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono leading-tight max-h-96 overflow-hidden rounded-lg border border-slate-800 shadow-2xl">
      
      {/* LEFT: ORIGINAL (REMOVALS) */}
      <div className="bg-[#0b0f1a] overflow-y-auto custom-scrollbar border-r border-slate-800">
        <div className="sticky top-0 p-2 bg-[#161b2a] border-b border-slate-800 text-slate-500 font-bold uppercase tracking-tighter">
          Original
        </div>
        <pre className="p-3 whitespace-pre-wrap break-all">
          {diff.map((part: Change, i: number) => (
            <span
              key={i}
              className={`${part.removed ? 'bg-red-500/20 text-red-400 block w-full' : part.added ? 'hidden' : 'text-slate-500 opacity-50'}`}
            >
              {part.removed || (!part.added && !part.removed) ? part.value : ''}
            </span>
          ))}
        </pre>
      </div>

      {/* RIGHT: MODIFIED (ADDITIONS) */}
      <div className="bg-[#0b0f1a] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 p-2 bg-[#161b2a] border-b border-slate-800 text-slate-500 font-bold uppercase tracking-tighter">
          Modified
        </div>
        <pre className="p-3 whitespace-pre-wrap break-all">
          {diff.map((part: Change, i: number) => (
            <span
              key={i}
              className={`${part.added ? 'bg-emerald-500/20 text-emerald-400 block w-full' : part.removed ? 'hidden' : 'text-slate-400'}`}
            >
              {part.added || (!part.added && !part.removed) ? part.value : ''}
            </span>
          ))}
        </pre>
      </div>

    </div>
  );
};
