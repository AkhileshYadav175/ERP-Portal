export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
