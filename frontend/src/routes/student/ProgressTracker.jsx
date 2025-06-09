import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { Bar } from 'react-chartjs-2';

export default function ProgressTracker() {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await api.get('/analytics/progress');
        setProgressData(data);
      } catch (err) {
        toast({ title: 'Failed to load progress', variant: 'destructive' });
      }
    };
    fetchProgress();
  }, []);

  const chartData = {
    labels: progressData.map(p => p.course_title),
    datasets: [
      {
        label: 'Completion %',
        data: progressData.map(p => p.completion_rate),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        {progressData.length === 0 ? (
          <p className="text-sm text-gray-500">No progress data available yet.</p>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </CardContent>
    </Card>
  );
}
