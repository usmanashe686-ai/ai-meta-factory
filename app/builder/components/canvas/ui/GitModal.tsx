'use client';

import React, { useState } from 'react';
import { GitBranch, GitCommit, GitMerge, Download, X } from 'lucide-react';

interface GitModalProps {
  onClose: () => void;
}

export const GitModal: React.FC<GitModalProps> = ({ onClose }) => {
  const [repoInitialized, setRepoInitialized] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');

  const handleInitRepo = () => {
    // In a real implementation, you would call a Git service or store
    setRepoInitialized(true);
    alert('Local repository initialized (simulated).');
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    alert(`Committed with message: ${commitMessage} (simulated).`);
    setCommitMessage('');
  };

  const handleExport = () => {
    alert('Export repository as ZIP (simulated).');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <GitBranch size={20} /> Git
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {!repoInitialized ? (
            <button
              onClick={handleInitRepo}
              className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <GitBranch size={16} /> Initialize Repository
            </button>
          ) : (
            <>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-sm text-green-400">✓ Repository initialized</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Commit message</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Fix: ..."
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-sm"
                />
              </div>

              <button
                onClick={handleCommit}
                disabled={!commitMessage.trim()}
                className="w-full py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <GitCommit size={16} /> Commit
              </button>

              <button
                onClick={handleExport}
                className="w-full py-2 bg-indigo-600 rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Download size={16} /> Export Repository
              </button>
            </>
          )}

          <div className="text-xs text-gray-400 text-center mt-4">
            Local Git simulation – no remote connection.
          </div>
        </div>
      </div>
    </div>
  );
};
