import { registerPlugin } from '@capacitor/core';

interface DownloadOptions {
  url: string;
  modelId: string;
}

// Fixed: Must match the @CapacitorPlugin(name = "ModelDownloader") exactly
const ModelDownloader = registerPlugin<any>('ModelDownloader');

export const useModelEngine = () => {
  const startDownload = async (options: DownloadOptions) => {
    try {
      console.log("📡 V4 Engine Handshake: Requesting", options.modelId);
      await ModelDownloader.download(options);
    } catch (error) {
      console.error("❌ Bridge Handshake Failed:", error);
    }
  };

  return { startDownload };
};
