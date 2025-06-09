import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function AdminAnalytics() {
  const [stats, setStats] = useState([]);

  const fetchStats = () => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => toast({ title: 'Failed to load analytics', variant: 'destructive' }));
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No analytics data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="courses" stroke="#6366f1" name="Courses Created" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="submissions" stroke="#10b981" name="Exercise Submissions" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="messages" stroke="#f59e0b" name="Messages Sent" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
