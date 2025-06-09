// src/components/system/SyncStatusBadge.jsx
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function SyncStatusBadge({ queueKey }) {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const refresh = () => {
      const stored = JSON.parse(localStorage.getItem(queueKey) || '[]');
      setQueue(stored);
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [queueKey]);

  return (
    <Badge variant={queue.length > 0 ? "outline" : "default"}>
      {queue.length > 0 ? `🟡 Pending (${queue.length})` : '🟢 Synced'}
    </Badge>
  );
}
