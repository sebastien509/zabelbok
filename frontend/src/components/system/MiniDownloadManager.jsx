// src/components/system/MiniDownloadManager.jsx
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function MiniDownloadManager() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const p = parseInt(localStorage.getItem('downloadProgress') || '0');
      setProgress(p);
      setActive(p > 0 && p < 100);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!active) return null;

  return (
    <div className="p-2 rounded bg-yellow-50 border text-xs">
      <p>Downloading content... {progress}%</p>
      <Progress value={progress} className="h-1 mt-1" />
    </div>
  );
}
