'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../state/project-store';
import { X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface EnvVarsModalProps {
  onClose: () => void;
}

export const EnvVarsModal: React.FC<EnvVarsModalProps> = ({ onClose }) => {
  const { envVars, setEnvVar, removeEnvVar } = useProjectStore();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setEnvVar(newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
  };

  const toggleShow = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Environment Variables</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-700 p-3 rounded text-sm">
            <p className="text-gray-300">These variables will be injected into your project during export (e.g., in a .env file).</p>
          </div>

          {/* List of existing vars */}
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">{key}</div>
                  <div className="font-mono text-sm truncate">
                    {showValues[key] ? value : '••••••••'}
                  </div>
                </div>
                <button
                  onClick={() => toggleShow(key)}
                  className="p-1 hover:bg-gray-600 rounded"
                  title={showValues[key] ? 'Hide' : 'Show'}
                >
                  {showValues[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => removeEnvVar(key)}
                  className="p-1 hover:bg-red-600 rounded"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {Object.keys(envVars).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No environment variables yet.</p>
            )}
          </div>

          {/* Add new var */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium mb-2">Add New Variable</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Key (e.g., DATABASE_URL)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-sm"
              />
              <input
                type="text"
                placeholder="Value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-sm"
              />
              <button
                onClick={handleAdd}
                disabled={!newKey.trim() || !newValue.trim()}
                className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Variable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
