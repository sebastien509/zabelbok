import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/auth/AuthProvider';
import { NotificationProvider } from './context/NotificationContext'; // ✅ Import this
import ToastProvider from './components2/ToastProvider';

import './index.css';
import '../i18n'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider> {/* ✅ Wrap entire App here */}
        <ToastProvider app="estrateji" />
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
