import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [showFingerprint, setShowFingerprint] = useState(false);

  return (
    <AppContext.Provider value={{ showFingerprint, setShowFingerprint }}>
      {children}
    </AppContext.Provider>
  );
};