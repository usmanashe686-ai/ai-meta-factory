import { Capacitor } from '@capacitor/core';

export const Llama = {
  generate: async (modelPath: string, prompt: string): Promise<string> => {
    if (Capacitor.getPlatform() !== 'android') {
      throw new Error('Only Android is supported');
    }
    return new Promise((resolve, reject) => {
      // @ts-ignore
      if (window.LlamaBridge && window.LlamaBridge.runModel) {
        try {
          // @ts-ignore
          const result = window.LlamaBridge.runModel(modelPath, prompt);
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
