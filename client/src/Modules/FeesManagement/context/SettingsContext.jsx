import React, { createContext, useContext, useState, useEffect } from 'react';
import { feesApi } from '../../../api/feesApi';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await feesApi.getSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Error loading settings provider:', err);
      setError('Failed to sync ERP settings cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSystemSettings = async (newData) => {
    try {
      const res = await feesApi.updateSettings(newData);
      if (res.success) {
        setSettings(res.data);
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  const resetSystemSettings = async () => {
    try {
      const res = await feesApi.resetSettings();
      if (res.success) {
        setSettings(res.data);
        return { success: true };
      }
    } catch (err) {
      console.error('Error resetting settings:', err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      error,
      refreshSettings: fetchSettings,
      updateSystemSettings,
      resetSystemSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSystemSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SettingsProvider');
  }
  return context;
};
