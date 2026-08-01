export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://erp-portal-production.up.railway.app',
  TIMEOUT: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
