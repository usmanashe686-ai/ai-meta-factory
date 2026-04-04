import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useLocalAIStore } from '../../app/builder/components/canvas/state/local-ai-store';

export const ModelImporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{ name: string; path: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const { addLocalModel, loadModel, setCurrentModel } = useLocalAIStore();

  const ensureModelsDir = async () => {
    try {
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
    } catch (err: any) {
      // Ignore "already exists" error
      if (!err.message.includes('already exists')) {
        throw err;
      }
    }
  };

  const listModels = async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureModelsDir();
      const result = await Filesystem.readdir({ path: 'models', directory: Directory.Data });
      const ggufFiles = result.files.filter(f => f.name.endsWith('.gguf')).map(f => ({
        name: f.name,
        path: `models/${f.name}`
      }));
      setModels(ggufFiles);
      if (ggufFiles.length === 0) {
        setError('No .gguf files found. Use "Import Model" to add one.');
      } else {
        for (const file of ggufFiles) {
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
    } catch (err: any) {
      console.error(err);
      setError(`Error reading models: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const importModel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gguf,application/octet-stream';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        const fileName = file.name;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64Data = (ev.target?.result as string).split(',')[1];
          await ensureModelsDir();
          const internalPath = `models/${fileName}`;
          await Filesystem.writeFile({
            path: internalPath,
            data: base64Data,
            directory: Directory.Data,
            recursive: true,
          });
          await listModels();
          alert(`Model "${fileName}" imported successfully!`);
          setImporting(false);
        };
        reader.onerror = () => {
          setError('Failed to read file');
          setImporting(false);
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        console.error(err);
        setError(`Import failed: ${err.message}`);
        setImporting(false);
      }
    };
    input.click();
  };

  const selectModel = (file: { name: string; path: string }) => {
    const model = useLocalAIStore.getState().availableModels.find(m => m.id === file.name);
    if (model) {
      loadModel(model.id);
      setCurrentModel(model);
      alert(`✅ Model "${file.name}" selected.`);
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
      <div className="flex gap-2 mb-3">
        <button onClick={importModel} disabled={importing} className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded">
          {importing ? 'Importing...' : '📂 Import Model'}
        </button>
        <button onClick={listModels} className="text-xs bg-indigo-600 px-2 py-1 rounded">Refresh</button>
      </div>
      {loading && <span className="text-xs text-slate-400">Loading...</span>}
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {models.map(model => (
          <div key={model.name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
            <div className="truncate text-xs text-slate-300">{model.name}</div>
            <button onClick={() => selectModel(model)} className="bg-indigo-600 hover:bg-indigo-500 text-xs px-2 py-1 rounded">
              Select
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Tip: You can also manually copy .gguf files to:<br/>
        <code className="text-[10px] break-all">/data/data/com.aimetafactory.app/files/models/</code>
      </p>
    </div>
  );
};
