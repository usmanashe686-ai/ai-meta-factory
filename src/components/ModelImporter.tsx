import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useLocalAIStore } from '../../app/builder/components/canvas/state/local-ai-store';

export const ModelImporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{ name: string; path: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { addLocalModel, loadModel, setCurrentModel } = useLocalAIStore();

  const listModels = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure models directory exists
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true });
      // Read the directory
      const result = await Filesystem.readdir({ path: 'models', directory: Directory.Data });
      console.log('Internal readdir result:', result);
      const ggufFiles = result.files.filter(f => f.name.endsWith('.gguf')).map(f => ({ name: f.name, path: `models/${f.name}` }));
      setModels(ggufFiles);
      if (ggufFiles.length === 0) {
        setError('No .gguf files found in internal storage. Please copy a model to the folder using a file manager.');
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
      await Filesystem.writeFile({
        path: testPath,
        data: 'Hello World',
        directory: Directory.Data,
        recursive: true,
      });
      const result = await Filesystem.readFile({
        path: testPath,
        directory: Directory.Data,
      });
      setTestResult(`Write/read successful: ${result.data}`);
      await Filesystem.deleteFile({ path: testPath, directory: Directory.Data });
    } catch (err: any) {
      setTestResult(`Test failed: ${err.message}`);
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

  useEffect(() => {
    listModels();
  }, []);

  return (
    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-300 mb-2">Available Models</h3>
      <div className="flex gap-2 mb-2">
        <button onClick={listModels} className="text-xs bg-indigo-600 px-2 py-1 rounded">Refresh</button>
        <button onClick={testWriteAndRead} className="text-xs bg-gray-600 px-2 py-1 rounded">Test Write</button>
      </div>
      {loading && <span className="text-xs text-slate-400">Loading...</span>}
      {testResult && <p className="text-xs text-yellow-400 mb-2">{testResult}</p>}
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
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
  );
};
