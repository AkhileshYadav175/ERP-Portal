const getBaseUrl = () => {
  // In development, always use '/api' to allow Vite's local dev server proxy to handle it.
  // This makes sure proxying works both on localhost and for other local network devices (like mobile phones).
  if (import.meta.env.DEV) {
    return '/api';
  }
  // In production (e.g. Vercel), use VITE_API_URL env var if available,
  // otherwise fallback to the production backend server url.
  return import.meta.env.VITE_API_URL || 'https://erp-portal-production-0cc1.up.railway.app/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
