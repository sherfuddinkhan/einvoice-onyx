// src/App.jsx
import React from 'react';
import { AuthProvider } from './AuthContext';
import TabContainer from './TabContainer';

function App() {
  return (
    <AuthProvider>
      <TabContainer />
    </AuthProvider>
  );
}

export default App;