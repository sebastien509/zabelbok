// ✅ src/components/ToastProvider.jsx
import React from 'react';
import { Toaster } from 'sonner';

export default function ToastProvider({ app = 'edu' }) {
  const config =
    app === 'estrateji'
      ? {
          position: 'top-right',
          theme: 'light',
          className: 'font-medium bg-white text-gray-800 shadow-lg rounded-md border border-gray-200',
          toastOptions: {
            style: {
              background: '#fffdf8',
              color: '#2c365e',
              border: '1px solid #ea7125',
            },
          },
        }
      : {
          position: 'bottom-right',
          theme: 'light',
          className: 'font-medium bg-white text-black rounded-md',
          toastOptions: {
            style: {
              background: '#f4f8f7',
              color: '#222',
              border: '1px solid #ccc',
            },
          },
        };

  return <Toaster richColors {...config} />;
}
