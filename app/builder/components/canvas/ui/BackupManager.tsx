'use client';

import React, { useEffect, useState } from 'react';
import { useBackupStore } from '../state/backup-store';
import { useProjectStore } from '../state/project-store';
import { Clock, RotateCcw, Trash2 } from 'lucide-react';

export const BackupManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { backups, loadBackups, restoreBackup, deleteBackup, isAutoSaveEnabled, toggleAutoSave } = useBackupStore();
  const { setFiles, setProjectName } = useProjectStore();
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const handleRestore = async (backupId: string) => {
    setRestoring(backupId);
    const backup = await restoreBackup(backupId);
    if (backup) {
      setFiles(backup.files);
      setProjectName(backup.projectName);
    }
    setRestoring(null);
    onClose();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto text-white">
        <h2 className="text-xl font-bold mb-4">Backups</h2>
        <div className="flex items-center gap-2 mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAutoSaveEnabled}
              onChange={(e) => toggleAutoSave(e.target.checked)}
            />
            Auto-save every 60s
          </label>
        </div>
        {backups.length === 0 ? (
          <p className="text-gray-400">No backups yet.</p>
        ) : (
          <ul className="space-y-2">
            {backups.map(backup => (
              <li key={backup.id} className="bg-gray-700 p-3 rounded flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium">{backup.projectName}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {formatDate(backup.timestamp)}
                  </div>
                  {backup.description && <div className="text-xs text-gray-500 mt-1">{backup.description}</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(backup.id)}
                    disabled={restoring === backup.id}
                    className="p-1 hover:bg-gray-600 rounded"
                    title="Restore"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => deleteBackup(backup.id)}
                    className="p-1 hover:bg-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-700 rounded w-full">
          Close
        </button>
      </div>
    </div>
  );
};
