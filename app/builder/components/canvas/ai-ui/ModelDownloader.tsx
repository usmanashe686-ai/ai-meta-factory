'use client';
import React, { useState } from 'react';
import { registerPlugin } from '@capacitor/core';
import { Download, Globe, Loader2, CheckCircle, AlertCircle, Zap, FileCode } from 'lucide-react';

// Connect to the Native Android Kotlin Plugin we created
const DownloadPlugin = registerPlugin<any>('DownloadPlugin');

export const ModelDownloader: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const startNativeDownload = async () => {
    if (!customUrl.trim()) {
      setError("Please enter a GGUF URL");
      return;
    }

    setLoading(true);
    setError('');
    setMsg('Handing off to Android Download Manager...');

    try {
      // 1. Clean the filename: remove spaces and special chars, add .gguf
      const nick = customName.trim() || 'ai_model';
      const fileName = `${nick.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gguf`;

      // 2. Trigger the Native Download (This runs in background)
      const result = await DownloadPlugin.download({
        url: customUrl.trim(),
        fileName: fileName
      });
      
      setMsg(`🚀 SUCCESS! ID: ${result.downloadId}. Swipe down your phone's notification bar to see the real-time progress!`);
      
      // Clear inputs after success
      setCustomName('');
      setCustomUrl('');
    } catch (err: any) {
      console.error(err);
      setError(`SYSTEM_ERROR: ${err.message || 'Native connection failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#0d1117] text-white rounded-xl border border-gray-800 max-w-lg mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Zap className="text-yellow-500" size={18} /> Native AI Installer
        </h2>
        <span className="text-[10px] text-gray-500 font-mono bg-gray-900 px-2 py-1 rounded">
          v2.0-native
        </span>
      </div>

      <div className="mb-6 p-4 border border-blue-900/30 bg-blue-950/10 rounded-lg space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] text-blue-400 uppercase font-bold flex items-center gap-1">
            <FileCode size={12} /> Model Nickname
          </label>
          <input
            type="text" 
            placeholder="e.g. My-Llama-3"
            className="w-full bg-black/40 border border-gray-700 p-2 rounded text-xs outline-none focus:border-blue-500 transition-all"
            value={customName} 
            onChange={(e) => setCustomName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-blue-400 uppercase font-bold flex items-center gap-1">
            <Globe size={12} /> HuggingFace GGUF URL
          </label>
          <div className="flex gap-2">
            <input
              type="text" 
              placeholder="https://huggingface.co/.../model.gguf"
              className="flex-1 bg-black/40 border border-gray-700 p-2 rounded text-xs outline-none focus:border-blue-500 transition-all"
              value={customUrl} 
              onChange={(e) => setCustomUrl(e.target.value)}
            />
            <button
              onClick={startNativeDownload}
              disabled={loading || !customUrl}
              className="bg-blue-600 px-4 rounded hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center min-w-[50px]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded text-[11px] text-green-300 flex items-start gap-2">
          <CheckCircle size={14} className="mt-0.5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-[11px] text-red-300 flex items-start gap-2 font-mono">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="text-[9px] text-gray-500 border-t border-gray-800 pt-3 italic">
        Note: This uses Android's System Download Manager. You can leave the app and the download will continue in the background.
      </div>
    </div>
  );
};
