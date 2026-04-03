import API_CONFIG from "@/lib/apiConfig";
import { create } from 'zustand';
import { useSessionStore } from './session-store';

export interface AIModel {
  localPath?: string;
  id: string;
  name: string;
  size: string;
  downloaded: boolean;
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
  generate: (prompt: string, provider?: string, options?: any, onToken?: (token: string) => void) => Promise<string>;
  loadSessionModel: () => Promise<void>;
  addLocalModel: (model: AIModel) => void;
  generateLocal: (prompt: string, onToken?: (token: string) => void) => Promise<string>;
}

declare global {
  interface Window {
    llama?: { generate: (options: { prompt: string; modelPath: string }) => Promise<{ text: string }> };
  }
}

export const useLocalAIStore = create<LocalAIState>((set, get) => ({
  availableModels: [],
  currentModel: null,
  isLoading: false,
  error: null,

  fetchAvailableModels: async () => {
    try {
      const res = await fetch(`${API_CONFIG.aiUrl}/models`);
      if (res.ok) {
        const data = await res.json();
        set({ availableModels: data });
      }
    } catch (error) {
      console.error("Failed to fetch models", error);
    }
  },

  addLocalModel: (model: AIModel) => {
    const exists = get().availableModels.some(m => m.id === model.id);
    if (!exists) {
      set(state => ({ availableModels: [...state.availableModels, { ...model, downloaded: true, active: false }] }));
    }
  },

  loadModel: async (modelId: string) => {
    const model = get().availableModels.find(m => m.id === modelId);
    if (!model) return false;
    set({ currentModel: model });
    useSessionStore.getState().setSelectedModelId(modelId);
    return true;
  },

  setCurrentModel: (model) => {
    if (model) get().loadModel(model.id);
    else get().unloadModel();
  },

  unloadModel: async () => {
    set({ currentModel: null });
    useSessionStore.getState().setSelectedModelId(null);
  },

  clearError: () => set({ error: null }),

  generateLocal: async (prompt: string, onToken?: (token: string) => void) => {
    const { currentModel } = get();
    if (!currentModel?.localPath) throw new Error('No local model selected');
    const { localEngine } = await import('../ai-local/LlamaNativeEngine');
    await localEngine.loadModel(currentModel.localPath);
    return localEngine.generateStream(prompt, onToken || (() => {}), { maxTokens: 500, temperature: 0.7 });
  },

  generate: async (prompt, provider = 'auto', options, onToken) => {
    const { currentModel, generateLocal } = get();
    if (currentModel && currentModel.type === 'llamacpp') {
      return generateLocal(prompt, onToken);
    }
    // Fallback to remote API (unchanged)
    const modelId = currentModel?.id || 'tinyllama-1.1b';
    const currentRetry = options?._retryCount || 0;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeout || 90000);
    set({ isLoading: true, error: null });
    const endpoint = onToken ? `${API_CONFIG.aiUrl}/ai/generate-stream` : `${API_CONFIG.aiUrl}/ai/generate`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ prompt, model: modelId, provider, stream: !!onToken, max_tokens: options?.max_tokens || 2000, temperature: options?.temperature ?? 0.2 }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (onToken && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "", full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";
          for (const line of lines) {
            const clean = line.trim();
            if (!clean.startsWith('data: ')) continue;
            const raw = clean.replace('data: ', '');
            if (raw === '[DONE]') { reader.cancel(); return full; }
            try {
              const parsed = JSON.parse(raw);
              const token = parsed.token || parsed.content || "";
              full += token;
              onToken(token);
            } catch (e) {}
          }
        }
        return full;
      }
      const data = await response.json();
      return data.result || data.text || '';
    } catch (err: any) {
      if (err.name === 'AbortError') set({ error: "Request timed out." });
      else if (onToken && currentRetry < 1) return get().generate(prompt, provider, { ...options, _retryCount: currentRetry + 1 }, onToken);
      else set({ error: err.message });
      return "";
    } finally {
      clearTimeout(timeout);
      set({ isLoading: false });
    }
  },

  loadSessionModel: async () => {
    const sessionModelId = useSessionStore.getState().selectedModelId;
    if (sessionModelId) await get().loadModel(sessionModelId);
  },
}));
