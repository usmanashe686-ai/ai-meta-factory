// lib/apiConfig.ts

const API_CONFIG = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://ai-meta-factory-api.onrender.com/api',

  buildServiceUrl:
    process.env.NEXT_PUBLIC_BUILD_SERVICE_URL ||
    'https://ai-meta-factory-api.onrender.com/build',

  realtimeUrl:
    process.env.NEXT_PUBLIC_REALTIME_URL ||
    'wss://ai-meta-factory-api.onrender.com/ws',

  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://ai-meta-factory.vercel.app',
};

// Safety check – development only
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const urls = Object.values(API_CONFIG);

  urls.forEach((url) => {
    if (url && url.includes('localhost')) {
      console.warn(
        '⚠️ Warning: localhost detected in API configuration.'
      );
    }
  });
}

export default API_CONFIG;
