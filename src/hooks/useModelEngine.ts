import { registerPlugin, Capacitor } from '@capacitor/core';

interface DownloadOptions {
  url: string;
  modelId: string;
}

const BackgroundDownload = registerPlugin<any>('BackgroundDownload');

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
      console.log("📡 Starting download via community plugin:", options.modelId);

      const ok = await requestNotificationPermission();
      if (!ok) {
        alert('Notification permission is required for background download.');
        return;
      }

      // Create a download request (saves to Downloads folder)
      const download = await BackgroundDownload.createDownload({
        url: options.url,
        description: options.modelId,
        title: `Downloading ${options.modelId}`,
        allowRoaming: true,
        allowMetered: true,
        visibleInDownloadsUi: true,
        destination: `file:///storage/emulated/0/Download/${options.modelId.replace(/[^a-z0-9]/gi, '_')}.gguf`
      });

      // Start the download
      await BackgroundDownload.start(download.id);
      alert(`Download started! Check your notification tray.`);
    } catch (error: any) {
      console.error("❌ Download error:", error);
      alert(`Download failed: ${error.message || error}`);
    }
  };

  const checkPlugin = async () => {
    try {
      if (!BackgroundDownload) {
        alert("Plugin is undefined");
        return;
      }
      const methods = Object.keys(BackgroundDownload);
      alert(`Plugin methods: ${methods.join(', ')}`);
    } catch (err) {
      console.error("Check error:", err);
      alert("Error checking plugin");
    }
  };

  return { startDownload, checkPlugin };
};
