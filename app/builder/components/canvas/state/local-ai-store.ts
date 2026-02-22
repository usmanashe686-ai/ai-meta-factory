import { create } from 'zustand';

export interface AIModel {
  id: string;
  name: string;
  size: string;
  bytes?: number;
  description?: string;
  downloaded: boolean;
  path?: string;
  active: boolean;
  type: 'llamacpp' | 'transformers';
  tags: string[];
}

export interface LocalAIState {
  availableModels: AIModel[];
  currentModel: AIModel | null;
  downloadProgress: Record<string, any>;
  isLoading: boolean;
  error: string | null;

  fetchAvailableModels: () => Promise<void>;
  downloadModel: (modelId: string) => Promise<void>;
  cancelDownload: (modelId: string) => Promise<void>;
  loadModel: (modelId: string) => Promise<boolean>;
  unloadModel: () => Promise<void>;
  setCurrentModel: (model: AIModel | null) => void;
  clearError: () => void;
  generate: (prompt: string, options?: any) => Promise<string>;
}

const FALLBACK_MODELS: AIModel[] = [
  {
    id: 'tinyllama-1.1b',
    name: 'TinyLlama 1.1B',
    size: '590 MB',
    downloaded: true,
    active: false,
    type: 'llamacpp',
    tags: ['llama', 'small'],
  },
];

export const useLocalAIStore = create<LocalAIState>((set, get) => ({
  availableModels: FALLBACK_MODELS,
  currentModel: null,
  downloadProgress: {},
  isLoading: false,
  error: null,

  fetchAvailableModels: async () => {
    try {
      const res = await fetch('http://localhost:8000/models');
      if (res.ok) {
        const data = await res.json();
        const models = data.map((m: any) => ({
          id: m.id,
          name: m.name,
          size: m.size,
          downloaded: true,
          active: false,
          type: 'llamacpp',
          tags: [],
        }));
        set({ availableModels: models, isLoading: false });
      } else {
        set({ availableModels: FALLBACK_MODELS, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch models, using fallback:', error);
      set({ availableModels: FALLBACK_MODELS, isLoading: false });
    }
  },

  downloadModel: async (modelId: string) => {
    set({ error: 'Download not supported in browser' });
  },

  cancelDownload: async (modelId: string) => {},

  loadModel: async (modelId: string) => {
    const model = get().availableModels.find(m => m.id === modelId);
    if (!model) return false;
    set({ currentModel: model });
    return true;
  },

  unloadModel: async () => {
    set({ currentModel: null });
  },

  setCurrentModel: (model) => set({ currentModel: model }),

  clearError: () => set({ error: null }),

  generate: async (prompt: string, options?: any) => {
    const { currentModel } = get();
    const modelId = currentModel?.id || 'tinyllama-1.1b';
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: modelId,
          max_tokens: options?.max_tokens || 300,
          temperature: options?.temperature || 0.7,
        }),
      });
      if (!response.ok) throw new Error(`AI service error: ${response.status}`);
      const data = await response.json();
      return data.text || data.generated_text || '';
    } catch (error) {
      console.error('Generate failed:', error);
      return 'Error generating response.';
    }
  },
}));
