import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ottergames.riverrush',
  appName: 'Otter River Rush',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#3b82f6',
    },
  },
};

export default config;
