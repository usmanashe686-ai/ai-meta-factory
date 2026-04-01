import { registerPlugin, Capacitor } from '@capacitor/core';

interface DownloadOptions {
  url: string;
  modelId: string;
}

// Register the native plugin – name must match Java @CapacitorPlugin(name = "ModelDownloaderPlugin")
const ModelDownloader = registerPlugin<any>('ModelDownloaderPlugin');

export const useModelEngine = () => {
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (Capacitor.getPlatform() === 'android') {
      try {
        const Permissions = (Capacitor as any).Plugins.Permissions;
        if (!Permissions) {
          console.warn('Permissions plugin not available');
          return false;
        }
        const { state } = await Permissions.query({ name: 'notifications' });
        if (state !== 'granted') {
          const result = await Permissions.request({ name: 'notifications' });
          return result.state === 'granted';
        }
        return true;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const startDownload = async (options: DownloadOptions) => {
    try {
      console.log("📡 V4 Handshake: Starting", options.modelId);
      console.log("Plugin object:", ModelDownloader);

      const ok = await requestNotificationPermission();
      if (!ok) {
        alert('Notification permission is required for background download.');
        return;
      }

      // Call native plugin and capture the result
      const result = await ModelDownloader.download(options);
      console.log("Native plugin returned:", result);
      alert(`Download started! Returned: ${JSON.stringify(result)}`);
    } catch (error: any) {
      console.error("❌ Bridge Error:", error);
      alert(`Download failed: ${error.message || error}`);
    }
  };

  // Test method: try to call a simple method (if we had one) or just check plugin existence
  const checkPlugin = async () => {
    try {
      console.log("Testing plugin existence...");
      if (!ModelDownloader) {
        alert("Plugin is undefined");
        return;
      }
      console.log("Plugin methods:", Object.keys(ModelDownloader));
      alert(`Plugin methods: ${Object.keys(ModelDownloader).join(', ')}`);
    } catch (err) {
      console.error("Check error:", err);
      alert("Error checking plugin");
    }
  };

  return { startDownload, checkPlugin };
};
