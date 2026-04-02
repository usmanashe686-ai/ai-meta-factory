import React from 'react';
import { useModelPicker } from '../hooks/useModelPicker';
import { useModelStore } from '../stores/modelStore';

export const ModelImporter: React.FC = () => {
  const { pickModel, selectedFile, error } = useModelPicker();
  const { setSelectedModelUri, setSelectedModelName } = useModelStore();

  const handlePick = async () => {
    const result = await pickModel();
    if (result) {
      setSelectedModelUri(result.path);
      setSelectedModelName(result.name);
      alert(`Selected: ${result.name}\nURI: ${result.path}`);
    } else if (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-300 mb-2">Select Downloaded Model</h3>
      <p className="text-xs text-slate-400 mb-2">Choose a GGUF file from your device (Downloads, etc.)</p>
      <button
        onClick={handlePick}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-medium transition"
      >
        📂 Browse for Model
      </button>
      {selectedFile && (
        <p className="text-xs text-slate-400 mt-2">Selected: {selectedFile.name}</p>
      )}
    </div>
  );
};
