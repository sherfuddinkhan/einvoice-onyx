// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {


  const [lastDocNo, setLastDocNo] = useState(() => localStorage.getItem('lastDocNo') || '');
const [lastDocDate, setLastDocDate] = useState(() => localStorage.getItem('lastDocDate') || '');
const [lastDocType, setLastDocType] = useState(() => localStorage.getItem('lastDocType') || '')
  // ---------- auth token ----------
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');

  // ---------- last generated invoice ----------
  const [lastIrn, setLastIrn] = useState(() => localStorage.getItem('lastIrn') || '');
  const [lastUserGstin, setLastUserGstin] = useState(() => localStorage.getItem('lastUserGstin') || '');

  // sync to localStorage
  useEffect(() => {
    authToken ? localStorage.setItem('authToken', authToken) : localStorage.removeItem('authToken');
  }, [authToken]);

  useEffect(() => {
    lastIrn ? localStorage.setItem('lastIrn', lastIrn) : localStorage.removeItem('lastIrn');
  }, [lastIrn]);

  useEffect(() => {
    lastUserGstin ? localStorage.setItem('lastUserGstin', lastUserGstin) : localStorage.removeItem('lastUserGstin');
  }, [lastUserGstin]);

  // Sync to localStorage
useEffect(() => {
  lastDocNo ? localStorage.setItem('lastDocNo', lastDocNo) : localStorage.removeItem('lastDocNo');
}, [lastDocNo]);

useEffect(() => {
  lastDocDate ? localStorage.setItem('lastDocDate', lastDocDate) : localStorage.removeItem('lastDocDate');
}, [lastDocDate]);

useEffect(() => {
  lastDocType ? localStorage.setItem('lastDocType', lastDocType) : localStorage.removeItem('lastDocType');
}, [lastDocType]);

// Update setLastInvoice
const setLastInvoice = (irn, userGstin, docNo, docDate, docType) => {
  setLastIrn(irn);
  setLastUserGstin(userGstin);
  if (docNo) setLastDocNo(docNo);
  if (docDate) setLastDocDate(docDate);
  if (docType) setLastDocType(docType);
};

  const login = (token) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken('');
    setLastIrn('');
    setLastUserGstin('');
  };

 

  return (
    <AuthContext.Provider
      value={{
        authToken,
        lastIrn,
        lastUserGstin,
        lastDocNo, lastDocDate, lastDocType,
        login,
        logout,
        setLastInvoice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};