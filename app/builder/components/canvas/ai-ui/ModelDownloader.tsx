'use client';
import React, { useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useLocalAIStore } from '../state/local-ai-store';
import { Download, Plus, Globe, Loader2, AlertCircle, CheckCircle, FolderSearch, HardDrive } from 'lucide-react';

export const ModelDownloader: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  // 🔍 DIAGNOSTIC FUNCTION
  const checkFilesystem = async () => {
    setDebugInfo('Scanning...');
    try {
      // Check if folder exists
      const folderContent = await Filesystem.readdir({
        path: 'ai_models',
        directory: Directory.Data
      }).catch(() => ({ files: [] }));

      // Check available space
      const uri = await Filesystem.getUri({
        path: '',
        directory: Directory.Data
      });

      setDebugInfo(
        `📁 Folder 'ai_models': ${folderContent.files.length} files found\n` +
        `📍 Internal Path: ${uri.uri}\n` +
        `📄 Files: ${folderContent.files.map(f => f.name).join(', ') || 'None'}`
      );
    } catch (err: any) {
      setDebugInfo(`❌ Scan Error: ${err.message}`);
    }
  };

  const startDownload = async (name: string, url: string, id: string) => {
    setDownloading(id);
    setError(null);
    setSuccess(null);
    const filePath = `ai_models/${id}.gguf`;

    try {
      await Filesystem.mkdir({
        path: 'ai_models',
        directory: Directory.Data,
        recursive: true
      }).catch(() => {});

      const result = await Filesystem.downloadFile({
        url: encodeURI(url.trim()),
        path: filePath,
        directory: Directory.Data,
        headers: {
          'Accept': 'application/octet-stream',
          'User-Agent': 'Mozilla/5.0'
        },
        progress: true
      });

      setSuccess(`✅ SUCCESS: Saved ${name}`);
    } catch (err: any) {
      setError(`SYSTEM_ERROR: ${err.message || JSON.stringify(err)}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-4 bg-[#0d1117] text-white rounded-xl border border-gray-800 max-w-lg mx-auto shadow-2xl">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Globe className="text-blue-500" size={18} /> AI Model Warehouse
      </h2>

      {/* 🛠️ DEBUG PANEL */}
      <div className="mb-4 p-3 bg-black/50 border border-yellow-700/30 rounded-lg">
        <button 
          onClick={checkFilesystem}
          className="flex items-center gap-2 text-[10px] bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500 px-3 py-1 rounded border border-yellow-700/50 mb-2"
        >
          <FolderSearch size={12} /> Run Storage Diagnostic
        </button>
        {debugInfo && (
          <pre className="text-[9px] text-gray-400 whitespace-pre-wrap leading-tight font-mono">
            {debugInfo}
          </pre>
        )}
      </div>

      <div className="mb-6 p-4 border border-blue-900/30 bg-blue-950/10 rounded-lg">
        <div className="space-y-2">
          <input 
            type="text" placeholder="Model Nickname"
            className="w-full bg-black/40 border border-gray-700 p-2 rounded text-xs outline-none focus:border-blue-500"
            value={customName} onChange={(e) => setCustomName(e.target.value)}
          />
          <div className="flex gap-2">
            <input 
              type="text" placeholder="HuggingFace GGUF URL"
              className="flex-1 bg-black/40 border border-gray-700 p-2 rounded text-xs outline-none focus:border-blue-500"
              value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
            />
            <button 
              onClick={() => startDownload(customName || 'custom', customUrl, `custom-${Date.now()}`)}
              disabled={!customUrl || !!downloading}
              className="bg-blue-600 p-2 rounded hover:bg-blue-500"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded text-[11px] text-red-300 break-all">
          <AlertCircle size={14} className="inline mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};
