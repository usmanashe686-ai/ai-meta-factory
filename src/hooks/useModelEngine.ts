import { registerPlugin, Capacitor } from '@capacitor/core';

interface DownloadOptions {
  url: string;
  modelId: string;
}

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

      // Call native plugin
      const result = await ModelDownloader.download(options);
      console.log("Native plugin returned:", result);
      alert("Download started! Check your notification tray.");
    } catch (error: any) {
      console.error("❌ Bridge Error:", error);
      alert(`Download failed: ${error.message || error}`);
    }
  };

  // Test method to check if plugin is accessible
  const testPlugin = async () => {
    try {
      console.log("Testing plugin existence...");
      if (!ModelDownloader) {
        console.error("ModelDownloader is undefined");
        alert("Plugin not registered");
        return;
      }
      console.log("Plugin methods:", Object.keys(ModelDownloader));
      alert("Plugin is available. Check console for methods.");
    } catch (err) {
      console.error("Test error:", err);
      alert("Error testing plugin");
    }
  };

  return { startDownload, testPlugin };
};
