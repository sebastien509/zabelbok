// src/components/system/MiniSyncLogOverlay.jsx
import { useEffect, useState } from 'react';

export default function MiniSyncLogOverlay() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem('syncLogs') || '[]');
      setLogs(stored);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!logs.length) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded p-2 shadow text-xs max-w-xs overflow-auto max-h-48">
      <strong>Sync Log:</strong>
      <ul className="space-y-1 mt-1">
        {logs.map((log, i) => (
          <li key={i}>• {log}</li>
        ))}
      </ul>
    </div>
  );
}
