import React, { useState } from 'react';
import { useModelEngine } from '../hooks/useModelEngine';

const RECOMMENDED_MODELS = [
  { name: 'DeepSeek-R1-1.5B', url: 'https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf', size: '1.0 GB' },
  { name: 'Phi-3-mini-4k',    url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf', size: '820 MB' },
  { name: 'Llama-3.2-1B',     url: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf', size: '720 MB' },
  { name: 'Qwen2.5-0.5B',     url: 'https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/Qwen2.5-0.5B-Instruct-Q4_K_M.gguf', size: '350 MB' },
];

export const ModelManager = () => {
  const { startDownload } = useModelEngine();
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (nick: string, modelUrl: string) => {
    if (!nick || !modelUrl) return alert("Please enter both Name and URL");
    setIsDownloading(true);
    await startDownload({ modelId: nick, url: modelUrl });
    setNickname('');
    setUrl('');
    setIsDownloading(false);
  };

  const handleRecommended = (model: typeof RECOMMENDED_MODELS[0]) => {
    setNickname(model.name);
    setUrl(model.url);
    handleDownload(model.name, model.url);
  };

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">🤖</span>
          Model Installer
        </h2>
        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">v4</span>
      </div>

      {/* Manual Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Model nickname</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g., My-Llama"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">GGUF URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://huggingface.co/.../model.gguf"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button
          onClick={() => handleDownload(nickname, url)}
          disabled={isDownloading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          {isDownloading ? 'Starting...' : 'Download'}
        </button>
      </div>

      {/* Recommended Models */}
      <div className="mt-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Recommended</p>
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin">
          {RECOMMENDED_MODELS.map((model) => (
            <button
              key={model.name}
              onClick={() => handleRecommended(model)}
              className="flex-shrink-0 bg-slate-800/50 hover:bg-slate-700 rounded-lg px-3 py-2 text-left transition"
            >
              <div className="text-sm font-medium text-indigo-300">{model.name}</div>
              <div className="text-[10px] text-slate-400">{model.size}</div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-2">
          Tap a model to start downloading instantly
        </p>
      </div>
    </div>
  );
};
