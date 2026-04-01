import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

interface FileEntry {
  name: string;
  path: string;
  size: number;
}

export const ModelImporter: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestStoragePermission = async () => {
    if (Capacitor.getPlatform() === 'android') {
      try {
        const Permissions = (Capacitor as any).Plugins.Permissions;
        if (!Permissions) return true;
        const { state } = await Permissions.query({ name: 'storage' });
        if (state !== 'granted') {
          const result = await Permissions.request({ name: 'storage' });
          const granted = result.state === 'granted';
          setPermissionGranted(granted);
          return granted;
        }
        setPermissionGranted(true);
        return true;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const listDownloads = async () => {
    setLoading(true);
    const ok = await requestStoragePermission();
    if (!ok) {
      setMessage('Storage permission required. Please grant in settings.');
      setLoading(false);
      return;
    }
    try {
      // Try to read from the Downloads folder using the standard Capacitor Downloads directory
      let result;
      try {
        // On Android, Directory.Downloads is the correct one
        result = await Filesystem.readdir({
          path: '',
          directory: Directory.Downloads,
        });
      } catch (e) {
        // Fallback to external storage + Download
        result = await Filesystem.readdir({
          path: 'Download',
          directory: Directory.ExternalStorage,
        });
      }
      const ggufFiles = result.files
        .filter(f => f.name.endsWith('.gguf'))
        .map(f => ({ name: f.name, path: f.uri || f.name, size: f.size || 0 }));
      setFiles(ggufFiles);
      setMessage(`Found ${ggufFiles.length} GGUF file(s) in Downloads.`);
    } catch (err: any) {
      console.error(err);
      setMessage(`Error reading Downloads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const moveToAppStorage = async (file: FileEntry) => {
    setLoading(true);
    try {
      // Ensure models directory exists
      await Filesystem.mkdir({
        path: 'models',
        directory: Directory.Data,
        recursive: true,
      }).catch(() => {});

      let fileData;
      try {
        // Try to read using uri if available
        fileData = await Filesystem.readFile({
          path: file.path,
          directory: Directory.Downloads,
        });
      } catch {
        // Fallback to external storage path
        fileData = await Filesystem.readFile({
          path: `Download/${file.name}`,
          directory: Directory.ExternalStorage,
        });
      }

      const destPath = `models/${file.name}`;
      await Filesystem.writeFile({
        path: destPath,
        data: fileData.data,
        directory: Directory.Data,
        recursive: true,
      });
      setMessage(`✅ Moved ${file.name} to app storage.`);
      listDownloads(); // refresh
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Failed to move ${file.name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listDownloads();
  }, []);

  if (loading && files.length === 0) return <div className="p-4 text-center text-slate-400">Loading...</div>;

  return (
    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-300 mb-2">Import Downloaded Models</h3>
      <p className="text-xs text-slate-400 mb-2">Move GGUF files from Downloads to app storage:</p>
      {files.length === 0 ? (
        <p className="text-xs text-slate-500">No .gguf files found in Downloads. Download a model first.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {files.map(file => (
            <div key={file.name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
              <div className="truncate text-xs text-slate-300">{file.name}</div>
              <button
                onClick={() => moveToAppStorage(file)}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs px-2 py-1 rounded"
              >
                Move
              </button>
            </div>
          ))}
        </div>
      )}
      {message && <p className="text-xs text-slate-400 mt-2">{message}</p>}
      <button onClick={listDownloads} className="text-xs text-indigo-400 mt-2">Refresh</button>
    </div>
  );
};
