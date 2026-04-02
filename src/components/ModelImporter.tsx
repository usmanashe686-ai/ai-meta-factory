import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const ModelImporter: React.FC = () => {
  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const requestStoragePermission = async () => {
    if (Capacitor.getPlatform() === 'android') {
      const Permissions = (Capacitor as any).Plugins.Permissions;
      if (!Permissions) return true;
      const { state } = await Permissions.query({ name: 'storage' });
      if (state !== 'granted') {
        const result = await Permissions.request({ name: 'storage' });
        return result.state === 'granted';
      }
      return true;
    }
    return true;
  };

  const listDownloads = async () => {
    setLoading(true);
    const ok = await requestStoragePermission();
    if (!ok) {
      setMessage('Storage permission required to access Downloads.');
      setLoading(false);
      return;
    }
    try {
      const result = await Filesystem.readdir({
        path: 'Download',
        directory: Directory.ExternalStorage,
      });
      const ggufFiles = result.files
        .filter(f => f.name.endsWith('.gguf'))
        .map(f => ({ name: f.name, path: `Download/${f.name}` }));
      setFiles(ggufFiles);
      if (ggufFiles.length === 0) {
        setMessage('No .gguf files found in Downloads.');
      } else {
        setMessage(`Found ${ggufFiles.length} model(s) in Downloads.`);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(`Error reading Downloads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const moveFile = async (file: { name: string; path: string }) => {
    setLoading(true);
    try {
      // Ensure models directory exists
      await Filesystem.mkdir({
        path: 'models',
        directory: Directory.Data,
        recursive: true,
      }).catch(() => {});
      // Read file from Downloads
      const result = await Filesystem.readFile({
        path: file.path,
        directory: Directory.ExternalStorage,
      });
      // Write to internal models folder
      const destPath = `models/${file.name}`;
      await Filesystem.writeFile({
        path: destPath,
        data: result.data,
        directory: Directory.Data,
        recursive: true,
      });
      setMessage(`✅ Moved ${file.name} to app storage.`);
      // Remove from Downloads? Optional – could delete but keep for now
      listDownloads(); // refresh list
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Failed to move ${file.name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const moveAll = async () => {
    for (const file of files) {
      await moveFile(file);
    }
  };

  useEffect(() => {
    listDownloads();
  }, []);

  if (loading && files.length === 0) return <div className="p-4 text-center text-slate-400">Loading...</div>;

  return (
    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-300 mb-2">Auto‑Import from Downloads</h3>
      <p className="text-xs text-slate-400 mb-2">GGUF files in your Downloads folder:</p>
      {files.length === 0 ? (
        <p className="text-xs text-slate-500">{message || 'No models found.'}</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {files.map(file => (
            <div key={file.name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
              <div className="truncate text-xs text-slate-300">{file.name}</div>
              <button
                onClick={() => moveFile(file)}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs px-2 py-1 rounded"
              >
                Move
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length > 1 && (
        <button onClick={moveAll} className="mt-2 text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded">
          Move All
        </button>
      )}
      {message && <p className="text-xs text-slate-400 mt-2">{message}</p>}
      <button onClick={listDownloads} className="text-xs text-indigo-400 mt-2">Refresh</button>
    </div>
  );
};
