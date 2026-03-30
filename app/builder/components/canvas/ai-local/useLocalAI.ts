import { useState, useEffect, useCallback } from 'react';
import { AI_MODELS, AIModel } from './models.config';

interface UseLocalAIReturn {
  downloadingModel: string | null;
  progress: number;
  installedModels: string[];
  downloadModel: (model: AIModel) => Promise<void>;
  deleteModel: (id: string) => void;
  generate: (prompt: string, modelId: string) => Promise<string>;
  isLoading: boolean;
}

export function useLocalAI(): UseLocalAIReturn {
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved models from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('installed_ai_models');
    if (saved) {
      try {
        setInstalledModels(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse installed models", e);
      }
    }
  }, []);

  const downloadModel = async (model: AIModel) => {
    if (downloadingModel) return;
    
    setDownloadingModel(model.id);
    setProgress(0);

    // Simulation of a chunked download. 
    // In production, this would use a fetch stream or axios onDownloadProgress
    const totalSteps = 20;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network latency
      const newProgress = Math.round((i / totalSteps) * 100);
      setProgress(newProgress);
    }

    const updated = [...installedModels, model.id];
    setInstalledModels(updated);
    localStorage.setItem('installed_ai_models', JSON.stringify(updated));
    setDownloadingModel(null);
  };

  const deleteModel = (id: string) => {
    const updated = installedModels.filter(m => m !== id);
    setInstalledModels(updated);
    localStorage.setItem('installed_ai_models', JSON.stringify(updated));
  };

  const generate = useCallback(async (prompt: string, modelId: string) => {
    setIsLoading(true);
    try {
      console.log(`Running inference locally using ${modelId}...`);
      // This is where you will eventually call your llama.cpp WASM or RPC bridge
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      return "Local AI Response: Analysis complete.";
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    downloadingModel, 
    progress, 
    installedModels, 
    downloadModel, 
    deleteModel,
    generate,
    isLoading 
  };
}
