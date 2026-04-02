import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const Llama = {
  generate: async (relativePath: string, prompt: string): Promise<string> => {
    if (Capacitor.getPlatform() !== 'android') {
      throw new Error('Only Android is supported');
    }
    // Get the absolute path of the file
    const stat = await Filesystem.stat({
      path: relativePath,
      directory: Directory.Data,
    });
    const absolutePath = stat.uri.replace('file://', '');
    return new Promise((resolve, reject) => {
      // @ts-ignore
      if (window.LlamaBridge && window.LlamaBridge.runModel) {
        try {
          // @ts-ignore
          const result = window.LlamaBridge.runModel(absolutePath, prompt);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error('LlamaBridge not available. Make sure the APK is up to date.'));
      }
    });
  }
};
