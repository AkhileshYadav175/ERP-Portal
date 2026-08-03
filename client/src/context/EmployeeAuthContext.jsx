import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { employeeApi } from '../api/employeeApi';

const EmployeeAuthContext = createContext(null);

export const EmployeeAuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [employeeToken, setEmployeeToken] = useState(localStorage.getItem('employeeToken') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeEmployeeAuth = async () => {
      if (employeeToken) {
        try {
          const data = await employeeApi.getMe();
          setEmployee(data.employee);
        } catch (error) {
          console.error('Employee authentication check failed:', error);
          employeeLogout();
        }
      }
      setLoading(false);
    };

    initializeEmployeeAuth();
  }, [employeeToken]);

  const employeeLogin = useCallback(async (email, password) => {
    try {
      const data = await employeeApi.login(email, password);
      const { token, employee: employeeData } = data;

      localStorage.setItem('employeeToken', token);
      localStorage.setItem('employee', JSON.stringify(employeeData));
      setEmployeeToken(token);
      setEmployee(employeeData);
      return { success: true };
    } catch (error) {
      console.error('Employee Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: message };
    }
  }, []);

  const employeeLogout = useCallback(() => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employee');
    setEmployeeToken('');
    setEmployee(null);
  }, []);

  const contextValue = useMemo(() => ({
    employee,
    employeeToken,
    loading,
    employeeLogin,
    employeeLogout,
    setEmployee
  }), [employee, employeeToken, loading, employeeLogin, employeeLogout]);

  return (
    <EmployeeAuthContext.Provider value={contextValue}>
      {children}
    </EmployeeAuthContext.Provider>
  );
};

export const useEmployeeAuth = () => {
  const context = useContext(EmployeeAuthContext);
  if (!context) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
};
