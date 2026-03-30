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

  const downloadModel = async (model: Model) => {
    setDownloading(model.id);
    setError(null);
    setSuccess(null);

    try {
      // 1. Ensure Directory exists
      await Filesystem.mkdir({
        path: 'ai_models',
        directory: Directory.Documents,
        recursive: true
      }).catch(() => {});

      // 2. The Production-Level Download Call
      const result = await Filesystem.downloadFile({
        url: encodeURI(model.url),
        path: `ai_models/${model.id}.gguf`,
        directory: Directory.Documents,
        headers: {
          'Accept': 'application/octet-stream',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
        },
        progress: true
      });

      setSuccess(`Downloaded to Documents/ai_models/${model.id}.gguf`);
      
      useLocalAIStore.getState().setCurrentModel({
        id: model.id,
        name: model.name,
        size: model.size,
        downloaded: true,
        localPath: result.path || '',
        active: false,
        type: 'llamacpp',
        tags: [],
      });

    } catch (err: any) {
      console.error('Download Error:', err);
      setError(`Failed: ${err.message || 'Check connection'}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-6 bg-[#0d1117] text-white rounded-xl border border-gray-800 max-w-lg mx-auto shadow-2xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Globe className="text-blue-500" /> AI Model Warehouse
      </h2>

      {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-xs text-red-400 flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}
      {success && <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded text-xs text-green-400 flex items-center gap-2"><CheckCircle size={14} /> {success}</div>}

      <div className="space-y-4">
        {PRESET_MODELS.map((model) => (
          <div key={model.id} className="bg-gray-800/30 border border-gray-700 p-4 rounded-lg flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm">{model.name}</h4>
              <p className="text-[10px] text-gray-400">{model.size}</p>
            </div>
            <button
              onClick={() => downloadModel(model)}
              disabled={!!downloading}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-xs font-bold disabled:opacity-50"
            >
              {downloading === model.id ? <Loader2 size={14} className="animate-spin" /> : 'Download'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
