import { env } from '@xenova/transformers';

// Configure local model path (optional)
env.localModelPath = '/models/';

// Types for model configuration
export interface ModelConfig {
  type: 'transformers' | 'llamacpp';
  modelId: string;
  quantized?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerationResult {
  text: string;
  model: string;
  tokens?: number;
}

class ModelManager {
  private transformersPipeline: any = null; // using any to avoid complex type issues
  private llamaInstance: any = null;
  private currentConfig: ModelConfig | null = null;

  private static instance: ModelManager;
  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async loadTransformersModel(modelId: string, task = 'text-generation'): Promise<void> {
    try {
      const { pipeline } = await import('@xenova/transformers');
      this.transformersPipeline = await pipeline(task, modelId, {
        quantized: true,
      });
      this.currentConfig = { type: 'transformers', modelId };
      console.log(`Transformers model ${modelId} loaded`);
    } catch (error) {
      console.error('Failed to load Transformers model:', error);
      throw error;
    }
  }

  async loadLlamaModel(modelPath: string, config?: { nCtx?: number; nGpuLayers?: number }): Promise<void> {
    try {
      const { LlamaCpp } = await import('@llama-node/llama-cpp');
      this.llamaInstance = await LlamaCpp.load({
        modelPath,
        nCtx: config?.nCtx || 2048,
        nGpuLayers: config?.nGpuLayers || 0,
      });
      this.currentConfig = { type: 'llamacpp', modelId: modelPath };
      console.log(`llama.cpp model ${modelPath} loaded`);
    } catch (error) {
      console.error('Failed to load llama.cpp model:', error);
      throw error;
    }
  }

  async generate(prompt: string, options?: Partial<ModelConfig>): Promise<GenerationResult> {
    const config = { ...this.currentConfig, ...options };
    if (!config) throw new Error('No model loaded');

    if (config.type === 'transformers') {
      if (!this.transformersPipeline) throw new Error('Transformers pipeline not loaded');
      const result = await this.transformersPipeline(prompt, {
        max_new_tokens: options?.maxTokens || 200,
        temperature: options?.temperature || 0.7,
        do_sample: true,
      });
      const generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      return {
        text: generatedText.replace(prompt, '').trim(),
        model: config.modelId,
      };
    } else if (config.type === 'llamacpp') {
      if (!this.llamaInstance) throw new Error('llama.cpp instance not loaded');
      const result = await this.llamaInstance.generate(prompt, {
        maxTokens: options?.maxTokens || 200,
        temperature: options?.temperature || 0.7,
        topP: 0.95,
      });
      return {
        text: result.text,
        model: config.modelId,
        tokens: result.tokens,
      };
    } else {
      throw new Error('Unsupported model type');
    }
  }

  unloadModel(): void {
    this.transformersPipeline = null;
    this.llamaInstance = null;
    this.currentConfig = null;
    console.log('Model unloaded');
  }
}

export default ModelManager.getInstance();
