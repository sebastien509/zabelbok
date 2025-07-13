import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import { AuthProvider } from './components/auth/AuthProvider';
import { NotificationProvider } from './context/NotificationContext';
import ToastProvider from './components2/ToastProvider';

import { registerSW } from 'virtual:pwa-register';
registerSW(); // ✅ Automatically registers and updates the service worker

import './index.css';
import '../i18n'; // ✅ Localization

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* <NotificationProvider> */}
          <ToastProvider app="estrateji" />
          <App />
        {/* </NotificationProvider> */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
