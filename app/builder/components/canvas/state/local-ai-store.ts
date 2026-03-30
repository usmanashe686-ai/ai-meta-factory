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

  loadModel: async (modelId: string) => {
    const model = get().availableModels.find(m => m.id === modelId);
    if (!model) return false;
    set({ currentModel: model });
    useSessionStore.getState().setSelectedModelId(modelId);
    return true;
  },

  setCurrentModel: (model) => {
    if (model) {
      get().loadModel(model.id);
    } else {
      get().unloadModel();
    }
  },

  unloadModel: async () => {
    set({ currentModel: null });
    useSessionStore.getState().setSelectedModelId(null);
  },

  clearError: () => set({ error: null }),

  generate: async (prompt, provider = 'auto', options, onToken) => {
    const { currentModel } = get();
    const modelId = currentModel?.id || 'tinyllama-1.1b';
    const currentRetry = options?._retryCount || 0;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeout || 90000);

    set({ isLoading: true, error: null });

    const endpoint = onToken
      ? `${API_CONFIG.aiUrl}/ai/generate-stream`
      : `${API_CONFIG.aiUrl}/ai/generate`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt,
          model: modelId,
          provider,
          stream: !!onToken,
          max_tokens: options?.max_tokens || 2000,
          temperature: options?.temperature ?? 0.2,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      if (onToken && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine.startsWith('data: ')) continue;
            const rawData = cleanLine.replace('data: ', '');

            if (rawData === '[DONE]') {
              reader.cancel();
              return fullContent;
            }

            try {
              const parsed = JSON.parse(rawData);
              const token = parsed.token || parsed.content || "";
              fullContent += token;
              onToken(token);
            } catch (e) {
              console.warn("SSE Parse Error", e);
            }
          }
        }
        return fullContent;
      }

      const data = await response.json();
      return data.result || data.text || '';

    } catch (err: any) {
      if (err.name === 'AbortError') {
        set({ error: "Request timed out." });
      } else if (onToken && currentRetry < 1) {
        return await get().generate(prompt, provider, { ...options, _retryCount: currentRetry + 1 });
      } else {
        set({ error: err.message });
      }
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
