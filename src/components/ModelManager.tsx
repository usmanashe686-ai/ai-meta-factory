import React, { useState } from 'react';
import { useModelEngine } from '../hooks/useModelEngine';

export const ModelManager = () => {
  const { startDownload } = useModelEngine();
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!nickname || !url) return alert("Please enter both Name and URL");
    
    setIsDownloading(true);
    console.log("🚀 Triggering Native Download for:", nickname);
    
    await startDownload({ 
      modelId: nickname, 
      url: url 
    });

    // Reset UI state
    setNickname('');
    setUrl('');
    setIsDownloading(false);
    alert("Download started! Check your notification tray.");
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
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDownloading ? 'Processing...' : '📥 Start Background Download'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-800/50">
        <div className="flex items-start gap-3 bg-indigo-500/5 p-3 rounded-lg">
          <span className="text-indigo-400 text-lg">💡</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This uses the <span className="text-indigo-300 font-bold">Industrial V4 Engine</span>. You can safely close the app; your download will continue in the background using multi-threaded chunks.
          </p>
        </div>
      </div>
    </div>
  );
};
