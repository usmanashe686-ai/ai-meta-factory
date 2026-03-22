import { API_BASE_URL } from "@/lib/apiConfig";
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

  // ✅ UPGRADED: Added onToken callback for real-time streaming
  generate: (
    prompt: string, 
    provider?: string, 
    options?: any, 
    onToken?: (token: string) => void
  ) => Promise<string>;

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
      const res = await fetch(`${API_BASE_URL}/models`);
      if (res.ok) {
        const data = await res.json();
        set({
          availableModels: data.map((m: any) => ({
            id: m.id,
            name: m.name,
            size: m.size,
            downloaded: true,
            active: false,
            type: 'llamacpp',
            tags: [],
          }))
        });
      } else {
        set({ availableModels: FALLBACK_MODELS });
      }
    } catch (error) {
      set({ availableModels: FALLBACK_MODELS });
    }
  },

  loadModel: async (modelId: string) => {
    const model = get().availableModels.find(m => m.id === modelId);
    if (!model) return false;

    set({ currentModel: model });
    useSessionStore.getState().setSelectedModelId(modelId);
    return true;
  },

  unloadModel: async () => {
    set({ currentModel: null });
    useSessionStore.getState().setSelectedModelId(null);
  },

  setCurrentModel: (model) => {
    set({ currentModel: model });
    if (model) {
      useSessionStore.getState().setSelectedModelId(model.id);
    } else {
      useSessionStore.getState().setSelectedModelId(null);
    }
  },

  clearError: () => set({ error: null }),

  // ✅ UPGRADED GENERATE: Supports standard JSON and Streaming
  generate: async (prompt: string, provider: string = 'auto', options?: any, onToken?: (token: string) => void) => {
    const { currentModel } = get();
    const modelId = currentModel?.id || 'tinyllama-1.1b';
    
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: modelId,
          provider,
          stream: !!onToken, // Request stream if callback is provided
          max_tokens: options?.max_tokens || 1000,
          temperature: options?.temperature || 0.2, // Lower temp for precise diffs
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      // Handle Streaming
      if (onToken && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Assume backend sends server-sent events or raw text chunks
          fullText += chunk;
          onToken(chunk);
        }
        set({ isLoading: false });
        return fullText;
      }

      // Handle Standard JSON
      const data = await response.json();
      set({ isLoading: false });
      return data.result || data.text || '';

    } catch (error: any) {
      console.error('Generate failed:', error);
      set({ isLoading: false, error: error.message });
      return '';
    }
  },

  loadSessionModel: async () => {
    const sessionModelId = useSessionStore.getState().selectedModelId;

    if (sessionModelId) {
      await get().loadModel(sessionModelId);
    } else if (get().availableModels.length > 0) {
      await get().loadModel(get().availableModels[0].id);
    }
  },
}));
