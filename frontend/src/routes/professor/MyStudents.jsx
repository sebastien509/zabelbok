// ✅ Enhanced MyStudents.jsx using new /progress/student/:id route
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare, ChevronDown, ChevronUp, RefreshCw,
  Mail, BookOpen, Award, FileText, Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components2/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  Avatar, AvatarFallback, AvatarImage
} from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MyStudents() {
  const [studentsByCourse, setStudentsByCourse] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState({ students: true, performance: false });
  const [expandedCourses, setExpandedCourses] = useState({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentsGrouped();
  }, []);

  const fetchStudentsGrouped = async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const res = await api.get('/courses/students-by-course');
      setStudentsByCourse(res.data);
      const initialExpanded = {};
      Object.keys(res.data).forEach(course => {
        initialExpanded[course] = true;
      });
      setExpandedCourses(initialExpanded);
    } catch (err) {
      toast({ title: 'Error loading students', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const fetchPerformance = async (studentId) => {
    try {
      setLoading(prev => ({ ...prev, performance: true }));
      if (selectedStudentId === studentId) {
        setSelectedStudentId(null);
        setPerformance(null);
        return;
      }
      const res = await api.get(`/progress/student/${studentId}`);
      setPerformance(res.data);
      setSelectedStudentId(studentId);
    } catch (err) {
      toast({ title: 'Error loading performance', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, performance: false }));
    }
  };

  const renderSubmissionCard = (item, type) => (
    <Card key={item[`${type}_id`]} className="p-3">
      <div className="flex justify-between items-center">
        <span>{item.title || `${type.toUpperCase()} #${item[`${type}_id`]}`}</span>
        <Badge>{item.score || item.grade || 'Ungraded'}</Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        Submitted: {format(new Date(item.submitted_at), 'PPP')}
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Students</h1>
        <Button onClick={fetchStudentsGrouped}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {Object.entries(studentsByCourse).map(([course, students]) => (
        <div key={course}>
          <div className="flex justify-between items-center cursor-pointer" onClick={() => {
            setExpandedCourses(prev => ({ ...prev, [course]: !prev[course] }));
          }}>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> {course}
              <Badge variant="secondary">{students.length} students</Badge>
            </h2>
            {expandedCourses[course] ? <ChevronUp /> : <ChevronDown />}
          </div>

          {expandedCourses[course] && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {students.map(student => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{student.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/messages/thread?user_id=${student.id}`)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => fetchPerformance(student.id)}
                      disabled={loading.performance && selectedStudentId === student.id}
                      className="w-full justify-between"
                    >
                      {selectedStudentId === student.id ? 'Hide Performance' : 'View Performance'}
                      {loading.performance && selectedStudentId === student.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    </Button>

                    {selectedStudentId === student.id && performance && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-600" /> Quiz Submissions
                        </h4>
                        <ScrollArea className="max-h-40 pr-2">
                          {performance.quizzes?.map(q => renderSubmissionCard(q, 'quiz'))}
                        </ScrollArea>

                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" /> Exercise Submissions
                        </h4>
                        <ScrollArea className="max-h-40 pr-2">
                          {performance.exercises?.map(e => renderSubmissionCard(e, 'exercise'))}
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
