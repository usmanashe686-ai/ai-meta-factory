import React, { useState } from 'react';
import { useModelEngine } from '../hooks/useModelEngine';
import { Filesystem, Directory } from '@capacitor/filesystem';

const RECOMMENDED_MODELS = [
  {
    name: 'DeepSeek-R1-1.5B (GGUF)',
    url: 'https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf',
    size: 1060
  },
  {
    name: 'Phi-3-mini-4k (GGUF)',
    url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf',
    size: 820
  },
  {
    name: 'Llama-3.2-1B (GGUF)',
    url: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    size: 720
  },
  {
    name: 'Qwen2.5-0.5B (GGUF)',
    url: 'https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/Qwen2.5-0.5B-Instruct-Q4_K_M.gguf',
    size: 350
  }
];

export const ModelManager = () => {
  const { startDownload, checkPlugin } = useModelEngine();
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [recommendedLoading, setRecommendedLoading] = useState<string | null>(null);
  const [testWriteResult, setTestWriteResult] = useState<string | null>(null);

  const handleDownload = async (nick: string, modelUrl: string) => {
    if (!nick || !modelUrl) return alert("Please enter both Name and URL");
    setIsDownloading(true);
    console.log("🚀 Triggering Native Download for:", nick);
    await startDownload({
      modelId: nick,
      url: modelUrl
    });
    setNickname('');
    setUrl('');
    setIsDownloading(false);
  };

  const handleRecommended = async (model: typeof RECOMMENDED_MODELS[0]) => {
    setRecommendedLoading(model.name);
    try {
      setNickname(model.name);
      setUrl(model.url);
      await handleDownload(model.name, model.url);
    } finally {
      setRecommendedLoading(null);
    }
  };

  const testFileWrite = async () => {
    try {
      await Filesystem.writeFile({
        path: 'test.txt',
        data: 'Hello World',
        directory: Directory.Data,
      });
      setTestWriteResult('✅ Write succeeded!');
    } catch (e: any) {
      setTestWriteResult(`❌ Write failed: ${e.message}`);
    }
  };

  const formatSize = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-white shadow-xl mx-4 my-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">📦</span>
          Model Installer
        </h2>
        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded-full text-slate-400 uppercase tracking-widest">v4.0 Native</span>
      </div>

      {/* Test buttons */}
      <div className="mb-4 p-3 bg-slate-800/50 rounded-lg flex gap-2">
        <button onClick={testFileWrite} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">
          Test File Write
        </button>
        <button onClick={checkPlugin} className="text-xs bg-green-600 hover:bg-green-500 px-3 py-1 rounded">
          Check Plugin
        </button>
      </div>
      {testWriteResult && (
        <p className="text-[10px] mb-2 text-slate-300">{testWriteResult}</p>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 ml-1">Model Nickname</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. TinyLlama-1.1B"
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 ml-1">HuggingFace GGUF URL</label>
          <div className="flex flex-col gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://huggingface.co/.../model.gguf"
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs font-mono text-indigo-300"
            />
            <button
              onClick={() => handleDownload(nickname, url)}
              disabled={isDownloading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDownloading ? 'Processing...' : '📥 Start Background Download'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-3 ml-1">✨ Recommended Models</label>
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {RECOMMENDED_MODELS.map((model) => (
              <button
                key={model.name}
                onClick={() => handleRecommended(model)}
                disabled={recommendedLoading === model.name}
                className="flex-shrink-0 w-48 text-left p-3 bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-all group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-300 group-hover:text-indigo-200 truncate">
                    {model.name}
                  </div>
                  <div className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    {formatSize(model.size)}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-1">
                  {model.url.split('/').pop()}
                </div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Scroll horizontally → click a model to download immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
