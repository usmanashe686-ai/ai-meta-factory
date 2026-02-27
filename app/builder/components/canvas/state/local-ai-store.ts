import { create } from 'zustand';
import { useSessionStore } from './session-store';

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
  isLoading: boolean;
  error: string | null;

  fetchAvailableModels: () => Promise<void>;
  loadModel: (modelId: string) => Promise<boolean>;
  unloadModel: () => Promise<void>;
  setCurrentModel: (model: AIModel | null) => void;
  clearError: () => void;
  generate: (prompt: string, options?: any) => Promise<string>;
  loadSessionModel: () => Promise<void>;
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
        set({ availableModels: models });
      } else {
        set({ availableModels: FALLBACK_MODELS });
      }
    } catch (error) {
      console.error('Failed to fetch models, using fallback:', error);
      set({ availableModels: FALLBACK_MODELS });
    }
  },

  loadModel: async (modelId: string) => {
    const model = get().availableModels.find(m => m.id === modelId);
    if (!model) return false;
    set({ currentModel: model });
    // Update session store
    useSessionStore.getState().setSelectedModelId(modelId);
    return true;
  },

  unloadModel: async () => {
    set({ currentModel: null });
    useSessionStore.getState().setSelectedModelId(null);
  },

  setCurrentModel: (model) => {
    set({ currentModel: model });
    if (model) useSessionStore.getState().setSelectedModelId(model.id);
    else useSessionStore.getState().setSelectedModelId(null);
  },

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
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.text || data.generated_text || '';
    } catch (error) {
      console.error('Generate failed:', error);
      return 'Error generating response.';
    }
  },

  loadSessionModel: async () => {
    const sessionModelId = useSessionStore.getState().selectedModelId;
    if (sessionModelId) {
      await get().loadModel(sessionModelId);
    } else if (get().availableModels.length > 0) {
      // Default to first available model
      await get().loadModel(get().availableModels[0].id);
    }
  },
}));
