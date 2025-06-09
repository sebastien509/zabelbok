import { useEffect, useState } from 'react';
import { getEnrolledStudents } from '@/services/courses';
import { getStudentPerformance } from '@/services/studentPerformance';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen, BarChart2, CheckCircle, User, Mail, Award, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

export default function ProfessorTracking() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const studentList = await getEnrolledStudents();
      const enriched = await Promise.all(
        studentList.data.map(async (s) => {
          const perf = await getStudentPerformance(s.id);
          return {
            ...s,
            quizAvg: perf.data.quizAvg || 'N/A',
            exercisesDone: perf.data.exerciseCompletion || '0/0',
            attendance: perf.data.attendance || '0%',
            lastActive: perf.data.lastActive || null
          };
        })
      );
// Calculate overall stats
const quizAvgs = enriched
  .map(s => parseFloat(s.quizAvg))
  .filter(avg => !isNaN(avg));

const avgQuizScore = quizAvgs.length > 0
  ? quizAvgs.reduce((a, b) => a + b, 0) / quizAvgs.length
  : 0;

const attendanceRates = enriched
  .map(s => parseFloat(s.attendance))
  .filter(val => !isNaN(val));

const avgAttendance = attendanceRates.length > 0
  ? (attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length).toFixed(1) + '%'
  : 'N/A';

setStats({
  totalStudents: enriched.length,
  avgQuizScore: avgQuizScore.toFixed(1),
  avgAttendance: avgAttendance
});

      setStudents(enriched);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to fetch student tracking data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Tracking
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Monitor student performance and engagement
          </p>
        </div>
        <Button variant="outline">
          <BookOpen className="mr-2 h-4 w-4" />
          View Course Details
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow hover:border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Students</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow hover:border-green-200">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <BarChart2 className="h-4 w-4" />
              <h3 className="text-sm font-medium">Avg Quiz Score</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgQuizScore || '0'}<span className="text-base text-muted-foreground">/100</span></div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow hover:border-amber-200">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <h3 className="text-sm font-medium">Avg Attendance</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgAttendance || '0%'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card className="hover:shadow-md transition-shadow border hover:border-primary/20 bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Student Performance</span>
            </div>
            <Badge variant="secondary" className="px-2.5 py-0.5 bg-white/90 backdrop-blur-sm">
              {students.length} {students.length === 1 ? 'Student' : 'Students'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Student</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Quiz Avg</span>
                  </div>
                </TableHead>
                <TableHead>Exercises</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(s => (
                <TableRow key={s.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={s.quizAvg === 'N/A' ? 'outline' : 
                              parseFloat(s.quizAvg) >= 80 ? 'default' : 
                              parseFloat(s.quizAvg) >= 60 ? 'secondary' : 'destructive'}
                      className="px-2.5 py-0.5 text-xs"
                    >
                      {s.quizAvg}
                      {s.quizAvg !== 'N/A' && <span className="ml-1">/100</span>}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.exercisesDone}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={s.attendance === '100%' ? 'default' : 
                              parseFloat(s.attendance) >= 80 ? 'secondary' : 'destructive'}
                      className="px-2.5 py-0.5 text-xs"
                    >
                      {s.attendance}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {s.lastActive ? format(new Date(s.lastActive), 'MMM d, yyyy') : 'Never'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}