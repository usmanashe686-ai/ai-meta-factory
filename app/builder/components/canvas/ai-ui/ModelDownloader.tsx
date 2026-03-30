'use client';

import React, { useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Http } from '@capacitor/http';
import { useLocalAIStore } from '../state/local-ai-store';
import { Download, Plus, Trash2, Globe } from 'lucide-react';

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

export const ModelDownloader: React.FC<{ onModelReady?: (modelPath: string) => void }> = ({ onModelReady }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Custom Model State
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');

  const downloadModel = async (model: Model) => {
    setDownloading(model.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await Http.request({
        method: 'GET',
        url: model.url,
        responseType: 'blob',
      });

      if (!response || !response.data) throw new Error('Download failed');

      const blob = response.data as Blob;
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const fileName = `${model.id}.gguf`;

      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Data,
      });

      setSuccess(`Success: ${model.name} saved.`);
      if (onModelReady) onModelReady(result.uri);

      useLocalAIStore.getState().setCurrentModel({
        id: model.id,
        name: model.name,
        size: model.size,
        downloaded: true,
        path: result.uri,
        active: false,
        type: 'llamacpp',
        tags: [],
      });

    } catch (err: any) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-6 bg-[#0d1117] text-white rounded-xl border border-gray-800 max-w-lg mx-auto shadow-2xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Globe className="text-blue-500" /> AI Model Warehouse
      </h2>

      {/* --- Custom URL Section --- */}
      <div className="mb-6 p-4 bg-blue-900/10 border border-blue-500/30 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
          <Plus size={16}/> External Model (Any GGUF)
        </h3>
        <div className="space-y-2">
          <input 
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Model Nickname"
            className="w-full bg-black border border-gray-700 p-2 text-sm rounded"
          />
          <div className="flex gap-2">
            <input 
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="HuggingFace GGUF URL"
              className="flex-1 bg-black border border-gray-700 p-2 text-sm rounded"
            />
            <button 
              onClick={() => downloadModel({ id: customName.replace(/\s+/g, '-').toLowerCase(), name: customName, size: 'External', url: customUrl })}
              disabled={!customUrl || !customName || !!downloading}
              className="bg-blue-600 hover:bg-blue-500 p-2 rounded disabled:opacity-50"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-800 mb-6" />

      {/* Status Messages */}
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-xs">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded text-xs">{success}</div>}

      {/* Preset List */}
      <div className="space-y-4">
        {PRESET_MODELS.map((model) => (
          <div key={model.id} className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm">{model.name}</h4>
              <p className="text-xs text-gray-400">{model.size}</p>
            </div>
            <button
              onClick={() => downloadModel(model)}
              disabled={downloading === model.id}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs font-bold transition-all"
            >
              {downloading === model.id ? 'Installing...' : 'Download'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
