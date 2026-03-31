import { registerPlugin } from '@capacitor/core';

interface DownloadOptions {
  url: string;
  modelId: string;
}

// Register the custom Native Bridge
const DownloadPlugin = registerPlugin<any>('DownloadPlugin');

export const useModelEngine = () => {
  const startDownload = async (options: DownloadOptions) => {
    try {
      // Calls the Java 'download' method in DownloadPlugin.java
      await DownloadPlugin.download(options);
      console.log(`Download for ${options.modelId} started via Native Engine.`);
    } catch (error) {
      console.error("Native Bridge Error:", error);
    }
  };

  return { startDownload };
};
