export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://erp-portal-production-0cc1.up.railway.app/api',
  TIMEOUT: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
