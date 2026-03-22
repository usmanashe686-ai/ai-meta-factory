'use client';

import React from 'react';

interface Props {
  original: string;
  suggested: string;
  onAccept: (code: string) => void;
  onReject: () => void;
}

export const DiffViewer: React.FC<Props> = ({
  original,
  suggested,
  onAccept,
  onReject,
}) => {
  const originalLines = original.split('\n');
  const newLines = suggested.split('\n');

  return (
    <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-3 text-[11px] font-mono">
      
      <div className="flex justify-between mb-2">
        <span className="text-blue-400">Live Diff</span>

        <div className="flex gap-2">
          <button
            onClick={() => onAccept(suggested)}
            className="bg-green-600 px-2 py-1 rounded"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="bg-red-600 px-2 py-1 rounded"
          >
            Reject
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-60 overflow-auto">
        {newLines.map((line, i) => {
          const oldLine = originalLines[i];

          const isChanged = line !== oldLine;

          return (
            <div
              key={i}
              className={`px-2 ${
                isChanged ? 'bg-green-900/40 text-green-300' : ''
              }`}
            >
              {isChanged ? '+' : ' '}
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
};
