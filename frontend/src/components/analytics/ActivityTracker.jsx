// ✅ ActivityTracker.jsx (logs activities for professors + students)
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function ActivityTracker() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    setLogs(storedLogs);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardHeader>
          <CardTitle>Activity Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {logs.map((log, i) => (
                <li key={i} className="border rounded p-2 bg-white">
                  <strong>{log.type}</strong> — {log.message} <br />
                  <small>{new Date(log.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
