'use client';

import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../state/session-store';
import { useLocalAIStore } from '../state/local-ai-store';
import { X, Sun, Moon, Save } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { theme, autoSave, setTheme, setAutoSave } = useSessionStore();
  const { availableModels, currentModel, setCurrentModel } = useLocalAIStore();

  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(300);
  const [includeDocs, setIncludeDocs] = useState(false);

  // Load settings from somewhere if persisted – for now, local state
  useEffect(() => {
    // Could load from localStorage later
  }, []);

  const handleSave = () => {
    // Persist settings (e.g., in session store or localStorage)
    alert('Settings saved (simulated).');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 text-white max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2 rounded flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Moon size={16} /> Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-2 rounded flex items-center justify-center gap-2 ${
                  theme === 'light' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Sun size={16} /> Light
              </button>
            </div>
          </div>

          {/* Auto-save */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto‑save (every 60s)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-sm font-medium mb-1">AI Model</label>
            <select
              value={currentModel?.id || ''}
              onChange={(e) => {
                const model = availableModels.find(m => m.id === e.target.value);
                setCurrentModel(model || null);
              }}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-sm"
            >
              <option value="">Select a model</option>
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>{model.name} ({model.size})</option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Temperature ({temperature.toFixed(1)})
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Max tokens */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Max tokens ({maxTokens})
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Include docs in AI context */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Include project documents in AI context (default)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeDocs}
                onChange={(e) => setIncludeDocs(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2 bg-green-600 rounded hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
