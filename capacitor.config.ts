import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.souhukaapp.tracker',
  appName: '総負荷量トラック',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
