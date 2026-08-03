import React, { createContext, useContext, useState, useMemo } from 'react';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  const contextValue = useMemo(() => ({ permissions, setPermissions }), [permissions]);

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
