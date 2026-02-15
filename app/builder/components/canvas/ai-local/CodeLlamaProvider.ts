import ModelManager, { ModelConfig, GenerationResult } from './ModelManager';

/**
 * Provider for CodeLlama models (optimized for code generation).
 * Uses llama.cpp backend by default.
 */
export class CodeLlamaProvider {
  private modelManager = ModelManager;
  private modelPath: string;
  private loaded: boolean = false;

  /**
   * @param modelPath Path to the .gguf file (or HuggingFace model ID). Default uses CodeLlama 7B.
   */
  constructor(modelPath: string = './models/codellama-7b.Q4_K_M.gguf') {
    this.modelPath = modelPath;
  }

  /**
   * Load the model into memory.
   * @param config Optional configuration (nCtx, nGpuLayers, etc.)
   */
  async loadModel(config?: Partial<ModelConfig>): Promise<void> {
    await this.modelManager.loadLlamaModel(this.modelPath, {
      nCtx: config?.maxTokens || 4096, // CodeLlama often uses larger context
    });
    this.loaded = true;
  }

  /**
   * Generate code/completion using the loaded model.
   * @param prompt Input prompt (code context or instruction)
   * @param options Generation options
   */
  async generate(prompt: string, options?: Partial<ModelConfig>): Promise<GenerationResult> {
    if (!this.loaded) {
      throw new Error('CodeLlama model not loaded. Call loadModel() first.');
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
