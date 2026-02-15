import React, { useState } from 'react';
import { useLocalAIStore } from '../state/local-ai-store';

interface AIPromptPanelProps {
  onGenerate?: (text: string) => void;
}

export const AIPromptPanel: React.FC<AIPromptPanelProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const { currentModel, generate, isLoading: storeLoading, error } = useLocalAIStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || !currentModel) return;
    try {
      const result = await generate(prompt);
      // Handle both string and object responses
      const output = typeof result === 'string' ? result : result?.text || '';
      onGenerate?.(output);
      setPrompt('');
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-white">AI Prompt</h3>
      <textarea
        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-400">
          Model: {currentModel?.name || 'None selected'}
        </span>
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || !currentModel || storeLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {storeLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
};
