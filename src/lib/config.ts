// Configuration management for the ERP system

export const config = {
  // PLEX API Configuration
  plex: {
    apiUrl: process.env.PLEX_API_URL,
    apiKey: process.env.PLEX_API_KEY,
    clientId: process.env.PLEX_CLIENT_ID,
    isConfigured: !!(process.env.PLEX_API_URL && process.env.PLEX_API_KEY && process.env.PLEX_CLIENT_ID),
  },
  
  // App Configuration
  app: {
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
  },
  
  // Feature Flags
  features: {
    useMockData: !process.env.PLEX_API_URL, // Use mock data if PLEX not configured
    enableNotifications: true,
    enableAnalytics: false,
  },
};

// Helper function to get the appropriate API client
export const getApiClient = () => {
  if (config.features.useMockData) {
    return import('./mock-plex-api').then(m => m.mockPlexApi);
  }
  return import('./plex-api').then(m => m.plexApi);
};
