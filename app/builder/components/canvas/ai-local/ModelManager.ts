import { env } from '@xenova/transformers';

// Configure local model path (optional)
env.localModelPath = '/models/';

// Types for model configuration
export interface ModelConfig {
  type: 'transformers'; // only transformers supported for now
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
  private transformersPipeline: any = null;
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
      this.transformersPipeline = await pipeline(task as any, modelId, {
        quantized: true,
      });
      this.currentConfig = { type: 'transformers', modelId };
      console.log(`Transformers model ${modelId} loaded`);
    } catch (error) {
      console.error('Failed to load Transformers model:', error);
      throw error;
    }
  }

  async generate(prompt: string, options?: Partial<ModelConfig>): Promise<GenerationResult> {
    const config = { ...this.currentConfig, ...options };
    if (!config) throw new Error('No model loaded');
    if (config.type !== 'transformers') throw new Error('Only Transformers models are supported currently');

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
  }

  unloadModel(): void {
    this.transformersPipeline = null;
    this.currentConfig = null;
    console.log('Model unloaded');
  }
}

export default ModelManager.getInstance();
