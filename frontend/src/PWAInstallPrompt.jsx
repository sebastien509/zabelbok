// ✅ PWAInstallPrompt.jsx (Custom Install Banner)
import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded shadow p-4 z-50">
      <h4 className="font-semibold">Install E-strateji?</h4>
      <button onClick={handleInstall} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">Install</button>
    </div>
  );
}
