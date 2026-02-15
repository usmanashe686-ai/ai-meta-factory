import ModelManager, { ModelConfig, GenerationResult } from './ModelManager';

/**
 * Provider for LLaMA2 models (via llama.cpp).
 * Handles loading and generation for LLaMA2 family models.
 */
export class LLaMA2Provider {
  private modelManager = ModelManager;
  private modelPath: string;
  private loaded: boolean = false;

  /**
   * @param modelPath Path to the .gguf file (or HuggingFace model ID). Default assumes a local file.
   */
  constructor(modelPath: string = './models/llama2-7b.Q4_K_M.gguf') {
    this.modelPath = modelPath;
  }

  /**
   * Load the model into memory.
   * @param config Optional configuration (nCtx, nGpuLayers, etc.)
   */
  async loadModel(config?: Partial<ModelConfig>): Promise<void> {
    await this.modelManager.loadLlamaModel(this.modelPath, {
      nCtx: config?.maxTokens || 2048,
      // Other llama.cpp specific options can be passed here if needed
    });
    this.loaded = true;
  }

  /**
   * Generate text using the loaded model.
   * @param prompt Input prompt
   * @param options Generation options (maxTokens, temperature, etc.)
   */
  async generate(prompt: string, options?: Partial<ModelConfig>): Promise<GenerationResult> {
    if (!this.loaded) {
      throw new Error('LLaMA2 model not loaded. Call loadModel() first.');
    }
    return this.modelManager.generate(prompt, {
      type: 'llamacpp',
      modelId: this.modelPath,
      ...options,
    });
  }

  /** Check if model is currently loaded. */
  isLoaded(): boolean {
    return this.loaded;
  }

  /** Unload model to free memory. */
  unload(): void {
    this.modelManager.unloadModel();
    this.loaded = false;
  }
}
