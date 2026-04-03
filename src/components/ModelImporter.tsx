import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useLocalAIStore } from '../../app/builder/components/canvas/state/local-ai-store';

export const ModelImporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{ name: string; path: string; source: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { addLocalModel, loadModel, setCurrentModel } = useLocalAIStore();

  const listModels = async () => {
    setLoading(true);
    setError(null);
    const foundModels: { name: string; path: string; source: string }[] = [];
    try {
      // Try internal models folder
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
      const internalResult = await Filesystem.readdir({ path: 'models', directory: Directory.Data });
      console.log('Internal readdir:', internalResult);
      for (const file of internalResult.files) {
        if (file.name.endsWith('.gguf')) {
          foundModels.push({ name: file.name, path: `models/${file.name}`, source: 'Internal' });
        }
      }
    } catch (err: any) {
      console.error('Internal read error:', err);
      setError(`Internal error: ${err.message}`);
    }

    // Also try external Downloads folder
    try {
      const externalResult = await Filesystem.readdir({ path: 'Download', directory: Directory.ExternalStorage });
      for (const file of externalResult.files) {
        if (file.name.endsWith('.gguf')) {
          foundModels.push({ name: file.name, path: `Download/${file.name}`, source: 'Downloads' });
        }
      }
    } catch (err: any) {
      console.error('External read error:', err);
      if (!error) setError(`Downloads error: ${err.message}`);
    }

    setModels(foundModels);
    if (foundModels.length === 0) {
      setError('No .gguf files found in internal models folder or Downloads. Please copy a model to internal storage or download via browser.');
    } else {
      // Register models in store (use internal path if available, else external)
      for (const file of foundModels) {
        const exists = useLocalAIStore.getState().availableModels.some(m => m.id === file.name);
        if (!exists) {
          addLocalModel({
            id: file.name,
            name: file.name.replace('.gguf', ''),
            size: 'Local',
            downloaded: true,
            active: false,
            type: 'llamacpp',
            tags: ['local'],
            localPath: file.path,
          });
        }
      }
    }
    setLoading(false);
  };

  const selectModel = (file: { name: string; path: string; source: string }) => {
    const model = useLocalAIStore.getState().availableModels.find(m => m.id === file.name);
    if (model) {
      loadModel(model.id);
      setCurrentModel(model);
      alert(`✅ Model "${file.name}" selected from ${file.source}.`);
    } else {
      alert(`Model not found in store.`);
    }
  };

  useEffect(() => {
    listModels();
  }, []);

  return (
    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-300 mb-2">Available Models</h3>
      <p className="text-xs text-slate-400 mb-3">
        Models found in internal storage or Downloads:
      </p>
      <div className="flex justify-between items-center mb-2">
        <button onClick={listModels} className="text-xs bg-indigo-600 px-2 py-1 rounded">Refresh</button>
        {loading && <span className="text-xs text-slate-400">Loading...</span>}
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {models.map(model => (
          <div key={model.name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
            <div className="truncate text-xs text-slate-300">{model.name} ({model.source})</div>
            <button
              onClick={() => selectModel(model)}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs px-2 py-1 rounded"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
