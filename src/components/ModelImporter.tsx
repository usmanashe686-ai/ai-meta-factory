import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useLocalAIStore } from '../../app/builder/components/canvas/state/local-ai-store';

export const ModelImporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{ name: string; path: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [rootFiles, setRootFiles] = useState<string[]>([]);
  const { addLocalModel, loadModel, setCurrentModel } = useLocalAIStore();

  const listModels = async () => {
    setLoading(true);
    setError(null);
    try {
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
      const result = await Filesystem.readdir({ path: 'models', directory: Directory.Data });
      console.log('Internal readdir:', result);
      const ggufFiles = result.files.filter(f => f.name.endsWith('.gguf')).map(f => ({ name: f.name, path: `models/${f.name}` }));
      setModels(ggufFiles);
      if (ggufFiles.length === 0) {
        setError('No .gguf files found. Use a file manager to copy your model to the folder above.');
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

  const testWriteAndRead = async () => {
    setTestResult(null);
    try {
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
      const testPath = 'models/test.txt';
      await Filesystem.writeFile({ path: testPath, data: 'Hello', directory: Directory.Data, recursive: true });
      const result = await Filesystem.readFile({ path: testPath, directory: Directory.Data });
      setTestResult(`Success: ${result.data}`);
      await Filesystem.deleteFile({ path: testPath, directory: Directory.Data });
    } catch (err: any) {
      setTestResult(`Failed: ${err.message}`);
    }
  };

  const listRoot = async () => {
    try {
      const result = await Filesystem.readdir({ path: '', directory: Directory.Data });
      setRootFiles(result.files.map(f => `${f.name} (${f.type})`));
    } catch (err: any) {
      setRootFiles([`Error: ${err.message}`]);
    }
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

  useEffect(() => { listModels(); }, []);

  return (
    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-300 mb-2">Available Models</h3>
      <div className="flex gap-2 mb-2 flex-wrap">
        <button onClick={listModels} className="text-xs bg-indigo-600 px-2 py-1 rounded">Refresh</button>
        <button onClick={testWriteAndRead} className="text-xs bg-gray-600 px-2 py-1 rounded">Test Write</button>
        <button onClick={listRoot} className="text-xs bg-gray-600 px-2 py-1 rounded">List Root</button>
      </div>
      {loading && <span className="text-xs text-slate-400">Loading...</span>}
      {testResult && <p className="text-xs text-yellow-400 mb-2">{testResult}</p>}
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      {rootFiles.length > 0 && (
        <div className="mb-2 p-2 bg-slate-700 rounded text-xs">
          <div className="font-bold">Root contents:</div>
          <ul className="list-disc list-inside">{rootFiles.map((f,i)=><li key={i}>{f}</li>)}</ul>
        </div>
      )}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {models.map(model => (
          <div key={model.name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
            <div className="truncate text-xs text-slate-300">{model.name}</div>
            <button onClick={() => selectModel(model)} className="bg-indigo-600 hover:bg-indigo-500 text-xs px-2 py-1 rounded">Select</button>
          </div>
        ))}
      </div>
    </div>
  );
};
