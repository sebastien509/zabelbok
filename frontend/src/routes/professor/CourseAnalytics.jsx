import { useEffect, useState } from 'react';
import { getCourseAnalytics } from '@/services/analytics';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, BookOpen, Award, CalendarCheck, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function CourseAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    // Mock courses - replace with actual API call
    setCourses([
      { id: '1', name: 'Introduction to Computer Science' },
      { id: '2', name: 'Advanced Algorithms' },
      { id: '3', name: 'Data Structures' }
    ]);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getCourseAnalytics();
      setData(res.data);
    } catch (error) {
      toast({
        title: 'Failed to load analytics',
        description: error.message || 'Could not fetch course analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="text-blue-600">Quiz Avg:</span> {payload[0].value}%
          </p>
          {payload[1] && (
            <p className="text-sm">
              <span className="text-green-600">Attendance:</span> {payload[1].value}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="grid gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center p-6">
        <Activity className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Analytics Data</h2>
        <p className="text-muted-foreground">Analytics will appear once students start completing coursework</p>
        <Button onClick={fetchAnalytics}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Course Analytics
          </h1>
          <p className="text-muted-foreground">Track student performance and engagement metrics</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={fetchAnalytics} 
            variant="outline" 
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
  {/* Avg Quiz Score */}
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Award className="h-4 w-4" />
        <h3 className="text-sm font-medium">Avg Quiz Score</h3>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {Math.round(data.reduce((acc, curr) => acc + curr.quiz_avg, 0) / data.length)}%
      </div>
    </CardContent>
  </Card>

  {/* Avg Attendance */}
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <div className="flex items-center space-x-2 text-muted-foreground">
        <CalendarCheck className="h-4 w-4" />
        <h3 className="text-sm font-medium">Avg Attendance</h3>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {Math.round(data.reduce((acc, curr) => acc + curr.attendance, 0) / data.length)}%
      </div>
    </CardContent>
  </Card>

  {/* Students Tracked */}
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <div className="flex items-center space-x-2 text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <h3 className="text-sm font-medium">Students Tracked</h3>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{data.length}</div>
    </CardContent>
  </Card>
</div>

    </div>
  );
}