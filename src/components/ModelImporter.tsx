import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useModelStore } from '../stores/modelStore';

export const ModelImporter: React.FC = () => {
  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { setSelectedModelUri, setSelectedModelName } = useModelStore();

  const listModels = async () => {
    setLoading(true);
    try {
      // Ensure models directory exists
      await Filesystem.mkdir({
        path: 'models',
        directory: Directory.Data,
        recursive: true,
      }).catch(() => {});
      const result = await Filesystem.readdir({
        path: 'models',
        directory: Directory.Data,
      });
      const ggufFiles = result.files
        .filter(f => f.name.endsWith('.gguf'))
        .map(f => ({ name: f.name, path: `models/${f.name}` }));
      setFiles(ggufFiles);
      setMessage(ggufFiles.length ? `Found ${ggufFiles.length} model(s) in app storage.` : 'No models found. Please copy a .gguf file to the app\'s models folder.');
    } catch (err: any) {
      console.error(err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectModel = (file: { name: string; path: string }) => {
    setSelectedModelUri(file.path);
    setSelectedModelName(file.name);
    alert(`Selected: ${file.name}`);
  };

  useEffect(() => {
    listModels();
  }, []);

  return (
    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-300 mb-2">Available Models</h3>
      <p className="text-xs text-slate-400 mb-2">
        Place your .gguf files in the folder:
        <br />
        <code className="text-[10px] break-all">/data/data/com.aimetafactory.app/files/models/</code>
        <br />
        (Use a file manager to copy them there)
      </p>
      {loading && <p className="text-xs text-slate-400">Loading...</p>}
      {files.length === 0 && !loading && (
        <p className="text-xs text-slate-500">No .gguf files found in app storage.</p>
      )}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {files.map(file => (
          <div key={file.name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
            <div className="truncate text-xs text-slate-300">{file.name}</div>
            <button
              onClick={() => selectModel(file)}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs px-2 py-1 rounded"
            >
              Select
            </button>
          </div>
        ))}
      </div>
      {message && <p className="text-xs text-slate-400 mt-2">{message}</p>}
      <button onClick={listModels} className="text-xs text-indigo-400 mt-2">Refresh</button>
    </div>
  );
};
