// ✅ StudentAnalytics.jsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    api.get('/analytics/student-progress').then(res => setAnalytics(res.data));
  }, []);

  const chartData = {
    labels: analytics.map(item => item.date),
    datasets: [
      {
        label: 'Completed Submissions',
        data: analytics.map(item => item.submissions),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.3,
      }
    ]
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader><CardTitle>Student Progress Over Time</CardTitle></CardHeader>
        <CardContent>
          <Line data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
