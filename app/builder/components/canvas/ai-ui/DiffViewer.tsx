'use client';

import React from 'react';

interface Props {
  diff: string;
  onAccept: () => void;
  onReject: () => void;
}

export const DiffViewer: React.FC<Props> = ({ diff, onAccept, onReject }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded p-4 text-sm">
      <h3 className="text-white font-semibold mb-2">AI Suggested Changes</h3>

      <pre className="bg-black p-3 rounded text-green-400 overflow-x-auto max-h-64">
        {diff}
      </pre>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onAccept}
          className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
        >
          Accept
        </button>

        <button
          onClick={onReject}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    </div>
  );
};
