import { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!online) {
    return <div className="bg-red-600 text-white text-center p-2">You are offline - some features may be unavailable.</div>;
  }

  return null;
}