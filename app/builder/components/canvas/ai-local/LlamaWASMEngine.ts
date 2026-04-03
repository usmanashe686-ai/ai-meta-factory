import { Filesystem, Directory } from '@capacitor/filesystem';
// @ts-ignore
import { Llama } from 'llama.rn';

export class LlamaWASMEngine {
  private model: any = null;
  private modelPath: string = '';

  async loadModel(modelPath: string): Promise<void> {
    if (this.model && this.modelPath === modelPath) return;
    const result = await Filesystem.readFile({ path: modelPath, directory: Directory.Data });
    const binary = atob(result.data as string);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    this.model = new Llama(bytes, { numThreads: 4, gpu: false, embedding: false });
    await this.model.load();
    this.modelPath = modelPath;
  }

  async generateStream(prompt: string, onToken: (token: string) => void, options: { maxTokens?: number, temperature?: number } = {}): Promise<string> {
    if (!this.model) throw new Error('Model not loaded');
    const maxTokens = options.maxTokens || 200;
    const temperature = options.temperature || 0.7;
    let full = '';
    const stream = await this.model.complete(prompt, { maxTokens, temperature, stream: true });
    for await (const chunk of stream) {
      const token = chunk.text;
      full += token;
      onToken(token);
    }
    return full;
  }

  unload() { this.model = null; this.modelPath = ''; }
}

export const localEngine = new LlamaWASMEngine();
