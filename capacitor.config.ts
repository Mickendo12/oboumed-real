
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.70b7a5d7b127450b802ddad8c323f4f0',
  appName: 'oboumed-health-scan-app',
  webDir: 'dist',
  server: {
    url: 'https://70b7a5d7-b127-450b-802d-dad8c323f4f0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;
