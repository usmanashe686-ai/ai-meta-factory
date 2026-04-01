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
        // Access the built-in permissions plugin using type assertion
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
      const ok = await requestNotificationPermission();
      if (!ok) {
        alert('Notification permission is required for background download.');
        return;
      }
      await ModelDownloader.download(options);
    } catch (error) {
      console.error("❌ Bridge Error:", error);
    }
  };

  return { startDownload };
};
