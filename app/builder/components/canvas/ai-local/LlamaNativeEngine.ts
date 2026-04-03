import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// This uses the native LlamaBridge exposed via JavaScript interface
export class LlamaNativeEngine {
  private loadedModelPath: string = '';

  async loadModel(modelPath: string): Promise<void> {
    this.loadedModelPath = modelPath;
    // Optionally pre‑load the model in native code by calling a method
    // For now, we just store the path.
  }

  async generateStream(
    prompt: string,
    onToken: (token: string) => void,
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<string> {
    if (!this.loadedModelPath) throw new Error('No model loaded');
    if (Capacitor.getPlatform() !== 'android') throw new Error('Only Android supported');
    // Call the native bridge (exposed as window.LlamaBridge)
    // @ts-ignore
    if (!window.LlamaBridge || !window.LlamaBridge.runModel) {
      throw new Error('Native bridge not available. Rebuild APK with latest changes.');
    }
    // For streaming, the native method returns the full string. We'll simulate streaming by splitting.
    const fullResponse = await new Promise<string>((resolve, reject) => {
      try {
        // @ts-ignore
        const result = window.LlamaBridge.runModel(this.loadedModelPath, prompt);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
    // Simulate streaming by sending the full response as a single token
    onToken(fullResponse);
    return fullResponse;
  }

  async generate(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string> {
    let result = '';
    await this.generateStream(prompt, (token) => { result += token; }, options);
    return result;
  }

  unload() {
    this.loadedModelPath = '';
  }
}

export const localEngine = new LlamaNativeEngine();
