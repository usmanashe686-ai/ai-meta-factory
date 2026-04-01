import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface DownloadOptions {
  url: string;
  modelId: string;
}

export const useModelEngine = () => {
  const startDownload = async (options: DownloadOptions) => {
    try {
      console.log("📥 Downloading model:", options.modelId);

      // Ensure the models directory exists
      await Filesystem.mkdir({
        path: 'models',
        directory: Directory.Data,
        recursive: true,
      }).catch(() => {});

      // Create a safe filename
      const fileName = `${options.modelId.replace(/[^a-z0-9]/gi, '_')}.gguf`;
      const filePath = `models/${fileName}`;

      // Fetch the file
      const response = await fetch(options.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Remove the data URL prefix
      const base64Data = base64.split(',')[1];

      // Write to internal storage
      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Data,
        recursive: true,
      });

      alert(`✅ Model saved to app storage!\nPath: ${filePath}`);
    } catch (error: any) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}`);
    }
  };

  return { startDownload };
};
