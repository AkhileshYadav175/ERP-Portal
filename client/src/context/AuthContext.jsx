import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const data = await authApi.getMe();
          setUser(data.user);
        } catch (error) {
          console.error('Auth verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      const { token: userToken, user: userData } = data;

      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (error) {
      console.warn('Backend session cleanup skipped or offline:', error.message);
    } finally {
      localStorage.removeItem('token');
      setToken('');
      setUser(null);
    }
  }, [token]);

  const contextValue = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
