'use client';
import React, { useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useLocalAIStore } from '../state/local-ai-store';
import { Download, Plus, Globe, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  size: string;
  url: string;
}

const PRESET_MODELS: Model[] = [
  {
    id: 'tinyllama',
    name: 'TinyLlama 1.1B',
    size: '590 MB',
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-GGUF/resolve/main/tinyllama-1.1b.Q4_K_M.gguf',
  },
  {
    id: 'qwen2',
    name: 'Qwen2 0.5B',
    size: '350 MB',
    url: 'https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0.5b-instruct-q4_k_m.gguf',
  },
];

export const ModelDownloader: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const startDownload = async (name: string, url: string, id: string) => {
    if (!url.trim().startsWith('http')) {
      setError("Please enter a valid URL starting with http");
      return;
    }

    setDownloading(id);
    setError(null);
    setSuccess(null);
    const filePath = `ai_models/${id}.gguf`;

    try {
      await Filesystem.mkdir({ path: 'ai_models', directory: Directory.Data, recursive: true }).catch(() => {});

      let existingSize = 0;
      try {
        const stat = await Filesystem.stat({ path: filePath, directory: Directory.Data });
        existingSize = stat.size || 0;
      } catch {}

      const downloadWithRetry = async (retries = 2): Promise<any> => {
        try {
          return await Filesystem.downloadFile({
            url: encodeURI(url.trim()),
            path: filePath,
            directory: Directory.Data,
            headers: {
              'Accept': 'application/octet-stream',
              'User-Agent': 'Mozilla/5.0',
              ...(existingSize > 0 ? { 'Range': `bytes=${existingSize}-` } : {})
            },
            progress: true
          });
        } catch (err) {
          if (retries <= 0) throw err;
          return downloadWithRetry(retries - 1);
        }
      };

      const result = await downloadWithRetry();
      const finalStat = await Filesystem.stat({ path: filePath, directory: Directory.Data });

      if (!finalStat.size || finalStat.size < 1000000) throw new Error("Download incomplete");

      setSuccess(`✅ ${name} ready!`);
      useLocalAIStore.getState().setCurrentModel({
        id, name, size: `${Math.round(finalStat.size / (1024 * 1024))} MB`,
        downloaded: true, localPath: result.path || '',
        active: false, type: 'llamacpp', tags: [],
      });
    } catch (err: any) {
      setError(`❌ Failed. Network unstable or storage issue.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-4 bg-[#0d1117] text-white rounded-xl border border-gray-800 max-w-lg mx-auto shadow-2xl">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Globe className="text-blue-500" size={18} /> AI Model Warehouse
      </h2>

      <div className="mb-6 p-4 border border-blue-900/30 bg-blue-950/10 rounded-lg">
        <h3 className="text-[10px] font-bold uppercase text-blue-400 mb-3 flex items-center gap-2">
          <Plus size={12} /> External Model (Any GGUF)
        </h3>
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
              className="bg-blue-600 p-2 rounded hover:bg-blue-500 disabled:opacity-50"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-2 bg-red-900/20 border border-red-500 rounded text-[10px] text-red-400 flex items-center gap-2"><AlertCircle size={12} /> {error}</div>}
      {success && <div className="mb-4 p-2 bg-green-900/20 border border-green-500 rounded text-[10px] text-green-400 flex items-center gap-2"><CheckCircle size={12} /> {success}</div>}

      <div className="space-y-3">
        {PRESET_MODELS.map((model) => (
          <div key={model.id} className="bg-gray-800/20 border border-gray-700 p-3 rounded-lg flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xs">{model.name}</h4>
              <p className="text-[9px] text-gray-500">{model.size}</p>
            </div>
            <button
              onClick={() => startDownload(model.name, model.url, model.id)}
              disabled={!!downloading}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-[10px] font-bold disabled:opacity-50 min-w-[80px]"
            >
              {downloading === model.id ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Download'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
