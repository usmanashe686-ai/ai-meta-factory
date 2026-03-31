import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aimetafactory.app',
  appName: 'AI Meta Factory',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    DownloadPlugin: {}
  }
};

export default config;
