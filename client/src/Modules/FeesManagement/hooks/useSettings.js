import { useState, useEffect, useCallback } from 'react';
import { feesApi } from '../../../api/feesApi';
import { useSystemSettings } from '../context/SettingsContext';

/**
 * useSettings - Hook for tracking, editing, and resetting fees management settings parameters.
 */
export const useSettings = () => {
  const { settings, updateSettingsState } = useSystemSettings();
  const [localSettings, setLocalSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feesApi.getSettings();
      if (res.success && res.data) {
        setLocalSettings(res.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Failed to fetch settings from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (settingsData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feesApi.updateSettings(settingsData);
      if (res.success && res.data) {
        setLocalSettings(res.data);
        updateSettingsState(res.data);
      }
      return res;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetToFactoryDefaults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feesApi.resetSettings();
      if (res.success && res.data) {
        setLocalSettings(res.data);
        updateSettingsState(res.data);
      }
      return res;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset settings.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings: localSettings || settings,
    loading,
    error,
    refetch: fetchSettings,
    saveSettings,
    resetToFactoryDefaults
  };
};

export default useSettings;
