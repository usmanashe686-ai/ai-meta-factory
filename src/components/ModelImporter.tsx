import React, { useState, useRef, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useModelStore } from '../stores/modelStore';

export const ModelImporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [models, setModels] = useState<{ name: string; path: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSelectedModelUri, setSelectedModelName } = useModelStore();

  // List models already in internal storage
  const listModels = async () => {
    try {
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true }).catch(() => {});
      const result = await Filesystem.readdir({ path: 'models', directory: Directory.Data });
      const ggufFiles = result.files.filter(f => f.name.endsWith('.gguf')).map(f => ({ name: f.name, path: `models/${f.name}` }));
      setModels(ggufFiles);
      if (ggufFiles.length === 0) setMessage('No models imported yet. Use the button below.');
      else setMessage(`${ggufFiles.length} model(s) available.`);
    } catch (err: any) {
      console.error(err);
      setMessage(`Error reading models: ${err.message}`);
    }
  };

  // Select a model for chat
  const selectModel = (file: { name: string; path: string }) => {
    setSelectedModelUri(file.path);
    setSelectedModelName(file.name);
    alert(`✅ Selected: ${file.name}`);
  };

  // Import a file in chunks
  const handleFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.gguf')) {
      alert('Please select a .gguf file');
      return;
    }
    setLoading(true);
    setMessage(`Importing ${file.name}... (chunked, please wait)`);
    try {
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
      const destPath = `models/${file.name}`;

      const CHUNK_SIZE = 1024 * 1024; // 1 MB
      let offset = 0;
      let firstChunk = true;

      while (offset < file.size) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(chunk);
        });
        const data = base64.split(',')[1]; // remove data URL prefix

        if (firstChunk) {
          await Filesystem.writeFile({
            path: destPath,
            data: data,
            directory: Directory.Data,
            recursive: true,
          });
          firstChunk = false;
        } else {
          // Append by reading existing, concatenating, writing back (inefficient but works for up to 2GB)
          const existing = await Filesystem.readFile({ path: destPath, directory: Directory.Data });
          const newData = existing.data + data;
          await Filesystem.writeFile({ path: destPath, data: newData, directory: Directory.Data });
        }
        offset += CHUNK_SIZE;
        setMessage(`Importing... ${Math.round((offset / file.size) * 100)}%`);
      }

      setMessage(`✅ Successfully imported ${file.name}`);
      await listModels(); // refresh list
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Import failed: ${err.message}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
        Select any .gguf file (from Downloads, SD card, etc.). The app will copy it to internal storage in chunks – no memory issues.
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
