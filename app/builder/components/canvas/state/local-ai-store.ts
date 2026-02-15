import { create } from 'zustand';
import ModelManager from '../ai-local/ModelManager';
import { ModelDownloader, ModelInfo, DownloadProgress } from '../ai-local/ModelDownloader';

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
  downloadProgress: Record<string, DownloadProgress>;
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

const downloader = new ModelDownloader();

export const useLocalAIStore = create<LocalAIState>((set, get) => ({
  availableModels: [],
  currentModel: null,
  downloadProgress: {},
  isLoading: false,
  error: null,

  fetchAvailableModels: async () => {
    set({ isLoading: true, error: null });
    try {
      const models = await downloader.fetchAvailableModels();
      set({ availableModels: models, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  downloadModel: async (modelId: string) => {
    set({ isLoading: true, error: null });
    try {
      const model = get().availableModels.find(m => m.id === modelId);
      if (!model) throw new Error('Model not found');

      const progressCallback = (progress: DownloadProgress) => {
        set(state => ({
          downloadProgress: {
            ...state.downloadProgress,
            [modelId]: progress,
          },
        }));
        if (progress.status === 'completed') {
          set(state => ({
            availableModels: state.availableModels.map(m =>
              m.id === modelId ? { ...m, downloaded: true, path: progress.filePath } : m
            ),
            downloadProgress: {
              ...state.downloadProgress,
              [modelId]: progress,
            },
            isLoading: false,
          }));
        }
      };

      const filePath = await downloader.downloadModel(modelId, progressCallback);
      set(state => ({
        availableModels: state.availableModels.map(m =>
          m.id === modelId ? { ...m, downloaded: true, path: filePath } : m
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  cancelDownload: async (modelId: string) => {
    try {
      await downloader.cancelDownload(modelId);
      set(state => ({
        downloadProgress: {
          ...state.downloadProgress,
          [modelId]: { ...state.downloadProgress[modelId], status: 'cancelled' },
        },
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  loadModel: async (modelId: string) => {
    set({ isLoading: true, error: null });
    try {
      const model = get().availableModels.find(m => m.id === modelId);
      if (!model) throw new Error('Model not found');
      if (!model.downloaded || !model.path) throw new Error('Model not downloaded');

      await ModelManager.unloadModel();

      if (model.type === 'llamacpp') {
        await ModelManager.loadLlamaModel(model.path);
      } else {
        await ModelManager.loadTransformersModel(model.id);
      }

      set(state => ({
        currentModel: model,
        availableModels: state.availableModels.map(m =>
          m.id === modelId ? { ...m, active: true } : { ...m, active: false }
        ),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    }
  },

  unloadModel: async () => {
    set({ isLoading: true, error: null });
    try {
      await ModelManager.unloadModel();
      set(state => ({
        currentModel: null,
        availableModels: state.availableModels.map(m => ({ ...m, active: false })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setCurrentModel: (model) => {
    set({ currentModel: model });
  },

  clearError: () => set({ error: null }),

  generate: async (prompt: string, options?: any) => {
    set({ isLoading: true, error: null });
    try {
      const result = await ModelManager.generate(prompt, options);
      set({ isLoading: false });
      return result.text;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
