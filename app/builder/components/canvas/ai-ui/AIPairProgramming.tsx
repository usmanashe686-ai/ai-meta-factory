'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { useProjectStore } from '../state/project-store';
import { useLocalAIStore } from '../state/local-ai-store';
import { Sparkles, X, Check, Copy, RefreshCw, ArrowDown } from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'completion' | 'refactor' | 'fix' | 'doc';
  title: string;
  description: string;
  code?: string;
  line?: number;
}

interface AIPairProgrammingProps {
  onClose?: () => void;
}

export const AIPairProgramming: React.FC<AIPairProgrammingProps> = ({ onClose }) => {
  const [enabled, setEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { files, activeFileId, updateFileContent } = useProjectStore();
  const { availableModels, currentModel, setCurrentModel, generate, fetchAvailableModels } = useLocalAIStore();

  // Fetch models and set default if none selected
  useEffect(() => {
    fetchAvailableModels();
  }, []);

  useEffect(() => {
    if (availableModels.length > 0 && !currentModel) {
      setCurrentModel(availableModels[0]);
    }
  }, [availableModels, currentModel, setCurrentModel]);

  const activeFile = files.find(f => f.id === activeFileId);
  const currentCode = activeFile?.content || '';

  const [debouncedCode] = useDebounce(currentCode, 1000);

  useEffect(() => {
    if (!enabled || !debouncedCode || !activeFile || loading) return;
    generateSuggestions(debouncedCode);
  }, [debouncedCode, enabled, activeFile]);

  const generateSuggestions = async (code: string) => {
    if (!currentModel) return;
    setLoading(true);
    try {
      const prompt = `You are an AI pair programmer. Analyze the following code and provide up to 3 helpful suggestions (completions, improvements, bug fixes). Output JSON array with objects having "type", "title", "description", and optional "code".\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
      const rawText = await generate(prompt);
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const validTypes = ['completion', 'refactor', 'fix', 'doc'];
        const validated = parsed.map((s: any, idx: number) => ({
          ...s,
          id: `sug-${idx}`,
          type: validTypes.includes(s.type) ? s.type : 'doc',
        }));
        setSuggestions(validated);
      } else {
        setSuggestions([{ 
          id: 'raw', 
          type: 'doc', 
          title: 'AI Suggestion', 
          description: rawText 
        }]);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = useCallback((suggestion: Suggestion) => {
    if (!suggestion.code || !activeFileId) return;
    updateFileContent(activeFileId, suggestion.code);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, [updateFileContent, activeFileId]);

  const insertBelowCursor = useCallback((suggestion: Suggestion) => {
    if (!suggestion.code || !activeFileId || !activeFile) return;
    // Simple: append at end (replace with proper cursor position later)
    const newContent = activeFile.content + '\n\n' + suggestion.code;
    updateFileContent(activeFileId, newContent);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, [updateFileContent, activeFileId, activeFile]);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const refresh = useCallback(() => {
    if (currentCode) generateSuggestions(currentCode);
  }, [currentCode]);

  if (!enabled) {
    return (
      <div className="p-4 text-center">
        <button
          onClick={() => setEnabled(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
        >
          Enable Pair Programming
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles size={18} /> AI Pair Programmer
        </h3>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-700 rounded"
              title="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm">
        {currentModel ? (
          <span className="text-xs text-green-400">Model: {currentModel.name}</span>
        ) : (
          <span className="text-xs text-yellow-400">No model selected</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {loading && (
          <div className="text-center text-gray-400 py-4">Thinking...</div>
        )}
        {suggestions.map(sug => (
          <div key={sug.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex justify-between items-start">
              <span className="text-xs px-2 py-0.5 bg-blue-600/20 text-blue-300 rounded uppercase">
                {sug.type}
              </span>
              <button onClick={() => dismissSuggestion(sug.id)} className="text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <p className="mt-2 text-sm font-medium">{sug.title}</p>
            <p className="text-xs text-gray-400 mt-1">{sug.description}</p>
            {sug.code && (
              <pre className="mt-2 p-2 bg-gray-950 rounded text-xs overflow-x-auto">
                {sug.code}
              </pre>
            )}
            <div className="flex justify-end gap-2 mt-2">
              {sug.code && (
                <button
                  onClick={() => applySuggestion(sug)}
                  className="px-2 py-1 bg-green-600 text-xs rounded hover:bg-green-700 flex items-center gap-1"
                >
                  <Check size={12} /> Apply
                </button>
              )}
              <button
                onClick={() => insertBelowCursor(sug)}
                className="px-2 py-1 bg-indigo-600 text-xs rounded hover:bg-indigo-700 flex items-center gap-1"
                title="Insert below cursor (or at end)"
              >
                <ArrowDown size={12} /> Insert
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(sug.code || sug.description)}
                className="px-2 py-1 bg-gray-700 text-xs rounded hover:bg-gray-600 flex items-center gap-1"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
          </div>
        ))}
        {!loading && suggestions.length === 0 && currentCode && (
          <div className="text-center text-gray-400 py-4">No suggestions at the moment.</div>
        )}
      </div>
    </div>
  );
};
