import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useLocalAIStore } from '../../app/builder/components/canvas/state/local-ai-store';

export const ModelImporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{ name: string; path: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [manualFileName, setManualFileName] = useState('');
  const { addLocalModel, loadModel, setCurrentModel } = useLocalAIStore();

  const ensureModelsDir = async () => {
    try {
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
    } catch (err: any) {
      if (!err.message.includes('already exists')) throw err;
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
        setError('No .gguf files found via readdir. If you manually copied a file, use "Manual File" below.');
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

  const selectModelByName = async () => {
    if (!manualFileName.trim()) {
      alert('Please enter a filename (e.g., Qwen2.5-0.5B-Instruct-Q4_K_M.gguf)');
      return;
    }
    const fileName = manualFileName.trim();
    const filePath = `models/${fileName}`;
    try {
      // Verify the file exists
      const stat = await Filesystem.stat({ path: filePath, directory: Directory.Data });
      if (stat.size === 0) throw new Error('File size zero');
      // Add to store
      const existing = useLocalAIStore.getState().availableModels.find(m => m.id === fileName);
      if (!existing) {
        addLocalModel({
          id: fileName,
          name: fileName.replace('.gguf', ''),
          size: `${(stat.size / (1024 * 1024)).toFixed(1)} MB`,
          downloaded: true,
          active: false,
          type: 'llamacpp',
          tags: ['local'],
          localPath: filePath,
        });
      }
      const model = useLocalAIStore.getState().availableModels.find(m => m.id === fileName);
      if (model) {
        loadModel(model.id);
        setCurrentModel(model);
        alert(`✅ Model "${fileName}" selected.`);
      } else {
        alert('Model not found after adding.');
      }
    } catch (err: any) {
      alert(`File not found: ${err.message}\nMake sure the filename is exact and the file is in the models folder.`);
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
      if (file.size > 100 * 1024 * 1024) {
        if (!confirm(`File size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Importing large files may crash the app. Please copy the file manually to the internal folder and use "Manual File" instead. Continue anyway?`)) {
          return;
        }
      }
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

      {/* Manual file input (bypasses readdir) */}
      <div className="mt-3 p-2 bg-slate-700/30 rounded">
        <p className="text-xs text-slate-300 mb-1">Manual File (if refresh fails):</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualFileName}
            onChange={(e) => setManualFileName(e.target.value)}
            placeholder="filename.gguf"
            className="flex-1 text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
          />
          <button onClick={selectModelByName} className="text-xs bg-yellow-600 px-2 py-1 rounded">
            Use this file
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Example: Qwen2.5-0.5B-Instruct-Q4_K_M.gguf
        </p>
      </div>

      {loading && <span className="text-xs text-slate-400">Loading...</span>}
      {error && <p className="text-xs text-red-400 mb-2 whitespace-pre-line">{error}</p>}
      <div className="space-y-2 max-h-48 overflow-y-auto mt-2">
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
        Tip: Manually copy .gguf files to:<br/>
        <code className="text-[10px] break-all">/data/data/com.aimetafactory.app/files/models/</code>
      </p>
    </div>
  );
};
