'use client';

import React, { useState } from 'react';
import { Download, X, CheckCircle } from 'lucide-react';

interface DownloadableModel {
  id: string;
  name: string;
  size: string;
  url: string;
}

const models: DownloadableModel[] = [
  {
    id: 'tinyllama',
    name: 'TinyLlama 1.1B',
    size: '~590MB',
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-GGUF/resolve/main/tinyllama-1.1b.Q4_K_M.gguf'
  }
];

interface Props {
  onClose: () => void;
  onModelDownloaded?: () => void;
  apiBaseUrl?: string;
}

export default function ModelDownloader({
  onClose,
  onModelDownloaded,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}: Props) {

  const [progress, setProgress] = useState<Record<string, number>>({});
  const [done, setDone] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const download = async (model: DownloadableModel) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/models/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: model.url,
          name: model.id + '.gguf'
        })
      });

      if (!res.ok) throw new Error('Download failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: streamDone, value } = await reader!.read();
        if (streamDone) break;

        const chunk = decoder.decode(value);
        const parts = chunk.split('\n\n');

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(part.slice(6));

            if (data.progress) {
              setProgress(prev => ({ ...prev, [model.id]: data.progress }));
            }

            if (data.status === 'completed') {
              setDone(prev => new Set(prev).add(model.id));
              onModelDownloaded?.();
            }

            if (data.error) throw new Error(data.error);

          } catch {
            // ignore bad chunks
          }
        }
      }

    } catch (err: any) {
      setErrors(prev => ({ ...prev, [model.id]: err.message }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 w-[500px] p-4 rounded-lg">
        
        <div className="flex justify-between mb-3">
          <h2 className="font-bold">Model Store</h2>
          <button onClick={onClose}><X /></button>
        </div>

        {models.map(m => {
          const p = progress[m.id];

          return (
            <div key={m.id} className="mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p>{m.name}</p>
                  <p className="text-xs text-gray-400">{m.size}</p>
                </div>

                {done.has(m.id) ? (
                  <CheckCircle className="text-green-400" />
                ) : p !== undefined ? (
                  <span>{Math.round(p)}%</span>
                ) : (
                  <button onClick={() => download(m)}>
                    <Download size={16} />
                  </button>
                )}
              </div>

              {p !== undefined && (
                <div className="h-2 bg-gray-600 mt-2">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${p}%` }}
                  />
                </div>
              )}

              {errors[m.id] && (
                <p className="text-red-400 text-xs">{errors[m.id]}</p>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
