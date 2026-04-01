import { Capacitor } from '@capacitor/core';

interface DownloadOptions {
  url: string;
  modelId: string;
}

export const useModelEngine = () => {
  const startDownload = async (options: DownloadOptions) => {
    try {
      console.log("Starting download:", options.modelId);
      // Simple browser download (works on any platform)
      const link = document.createElement('a');
      link.href = options.url;
      link.download = `${options.modelId.replace(/[^a-z0-9]/gi, '_')}.gguf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Download started in browser! Check your Downloads folder.");
    } catch (error: any) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}`);
    }
  };

  return { startDownload };
};
