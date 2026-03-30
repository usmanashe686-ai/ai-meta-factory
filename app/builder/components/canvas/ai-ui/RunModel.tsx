'use client';

import React, { useState } from 'react';
import { useLocalAIStore } from '../state/local-ai-store';

// This will call your Android native plugin
declare global {
  interface Window {
    llama?: {
      generate: (options: {
        prompt: string;
        modelPath: string;
      }) => Promise<{ text: string }>;
    };
  }
}

export const RunModel: React.FC = () => {
  const { currentModel } = useLocalAIStore();

  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runModel = async () => {
    if (!currentModel?.localPath) {
      alert('No model loaded');
      return;
    }

    setLoading(true);
    setOutput('');

    try {
      // Call native llama.cpp
      const result = await window.llama?.generate({
        prompt,
        modelPath: currentModel.path.replace("file://", ""),
      });

      setOutput(result?.text || 'No response');
    } catch (err: any) {
      console.error(err);
      setOutput('Error running model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Run Local AI</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="w-full p-3 rounded bg-gray-800 mb-4"
      />

      <button
        onClick={runModel}
        disabled={loading}
        className="bg-green-600 px-4 py-2 rounded w-full"
      >
        {loading ? 'Running...' : 'Run Model'}
      </button>

      {output && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <p className="text-sm">{output}</p>
        </div>
      )}
    </div>
  );
};
