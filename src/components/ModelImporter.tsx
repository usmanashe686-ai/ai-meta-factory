import React, { useState, useRef, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useModelStore } from '../stores/modelStore';
import { useLocalAIStore } from '../../app/builder/components/canvas/state/local-ai-store';

export const ModelImporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [models, setModels] = useState<{ name: string; path: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSelectedModelUri, setSelectedModelName } = useModelStore();
  const addLocalModel = useLocalAIStore(state => state.addLocalModel);
  const loadModel = useLocalAIStore(state => state.loadModel);

  const listModels = async () => {
    try {
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
      const result = await Filesystem.readdir({ path: 'models', directory: Directory.Data });
      const ggufFiles = result.files.filter(f => f.name.endsWith('.gguf')).map(f => ({ name: f.name, path: `models/${f.name}` }));
      setModels(ggufFiles);
      if (ggufFiles.length === 0) setMessage('No models imported yet.');
      else setMessage(`${ggufFiles.length} model(s) available.`);
    } catch (err: any) {
      console.error(err);
      setMessage(`Error: ${err.message}`);
    }
  };

  const selectModel = (file: { name: string; path: string }) => {
    setSelectedModelUri(file.path);
    setSelectedModelName(file.name);
    // Also add to the local AI store so it appears in the chat sidebar
    const localModel = {
      id: file.name,
      name: file.name,
      size: 'Local',
      downloaded: true,
      active: false,
      type: 'llamacpp' as const,
      tags: ['local'],
      localPath: file.path, // relative to Directory.Data
    };
    addLocalModel(localModel);
    loadModel(file.name);
    alert(`✅ Model "${file.name}" is now available in the AI Chat.`);
  };

  const importFile = async (file: File) => {
    setLoading(true);
    setMessage(`Importing ${file.name}...`);
    try {
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
      const destPath = `models/${file.name}`;
      try {
        await Filesystem.deleteFile({ path: destPath, directory: Directory.Data });
      } catch (e) {}
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await Filesystem.writeFile({
        path: destPath,
        data: base64,
        directory: Directory.Data,
        recursive: false,
      });
      setMessage(`✅ Imported ${file.name}`);
      await listModels();
      // Automatically select after import
      selectModel({ name: file.name, path: destPath });
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.gguf')) {
      alert('Please select a .gguf file');
      return;
    }
    await importFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    listModels();
  }, []);

  return (
    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-300 mb-2">Model Management</h3>
      <input
        type="file"
        ref={fileInputRef}
        accept=".gguf"
        onChange={handleFilePick}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 mb-3"
      >
        📂 Import Model from Device
      </button>
      <p className="text-xs text-slate-400 mb-3">
        Select a .gguf file (e.g., from Downloads). The app will copy it to internal storage.
      </p>
      <div className="border-t border-slate-700 pt-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-semibold text-indigo-300">Available Models</h4>
          <button onClick={listModels} className="text-xs text-indigo-400">Refresh</button>
        </div>
        {loading && <p className="text-xs text-slate-400">Processing...</p>}
        {!loading && models.length === 0 && <p className="text-xs text-slate-500">{message}</p>}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {models.map(model => (
            <div key={model.name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
              <div className="truncate text-xs text-slate-300">{model.name}</div>
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
    </div>
  );
};
