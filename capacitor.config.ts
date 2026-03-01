import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aimetafactory.app',
  appName: 'AI Meta Factory',
  webDir: 'out',
  server: {
    url: 'http://localhost',
    cleartext: true
  }
};

export default config;
