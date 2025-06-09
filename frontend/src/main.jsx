import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/auth/AuthProvider';
import { NotificationProvider } from './context/NotificationContext'; // ✅ Import this
import './index.css';
import '../i18n'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider> {/* ✅ Wrap entire App here */}
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
