import axios from 'axios';
import { API_CONFIG } from '../config/api';

const employeeAxios = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Request Interceptor: Attach Employee Token automatically
employeeAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employeeToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch Token Expiries / 401 Unauthorized
employeeAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized employee request - session expired.');
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employee');
    }
    return Promise.reject(error);
  }
);

export default employeeAxios;
