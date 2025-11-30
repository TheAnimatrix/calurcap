import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.avarnic.calurcap',
  appName: 'Calurcap',
  webDir: 'build',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
