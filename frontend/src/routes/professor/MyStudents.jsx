import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronDown, ChevronUp, RefreshCw, Mail, User, BookOpen, Award, FileText, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  getExerciseSubmissionsByStudent,
  getQuizSubmissionsByStudent
} from '@/services/studentPerformance';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MyStudents() {
  const [studentsByCourse, setStudentsByCourse] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState({ students: true, performance: false });
  const [expandedCourses, setExpandedCourses] = useState({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentsGrouped();
  }, []);

  const toggleCourse = (courseTitle) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseTitle]: !prev[courseTitle]
    }));
  };

  const fetchStudentsGrouped = async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const res = await api.get('/courses/students-by-course');
      setStudentsByCourse(res.data);
      // Initialize all courses as expanded
      const initialExpanded = {};
      Object.keys(res.data).forEach(course => {
        initialExpanded[course] = true;
      });
      setExpandedCourses(initialExpanded);
    } catch (error) {
      toast({
        title: 'Failed to fetch students',
        description: error.response?.data?.message || error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const fetchPerformance = async (studentId) => {
    try {
      setLoading(prev => ({ ...prev, performance: true }));
      if (selectedStudent === studentId) {
        setSelectedStudent(null);
        setPerformance(null);
        return;
      }
      const [quizSubs, exerciseSubs] = await Promise.all([
        getQuizSubmissionsByStudent(studentId),
        getExerciseSubmissionsByStudent(studentId)
      ]);
      setPerformance({
        quizSubs: quizSubs.data,
        exerciseSubs: exerciseSubs.data,
        quizAvg: calculateAverage(quizSubs.data),
        exerciseCompletion: calculateCompletion(exerciseSubs.data)
      });
      setSelectedStudent(studentId);
    } catch (error) {
      toast({
        title: 'Failed to fetch performance',
        description: error.response?.data?.message || error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, performance: false }));
    }
  };

  const calculateAverage = (subs) => {
    if (!subs.length) return 0;
    const graded = subs.filter(s => s.score !== null);
    if (!graded.length) return 'N/A';
    return Math.round((graded.reduce((a, s) => a + s.score, 0) / graded.length) * 10) / 10;
  };

  const calculateCompletion = (subs) => {
    if (!subs.length) return '0/0';
    const completed = subs.filter(s => s.submitted_at).length;
    return `${completed}/${subs.length}`;
  };

  const renderSubmissionItem = (type, items) => {
    if (!items.length) {
      return (
       
<div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
  {(type === 'quiz' ? <Award className="h-8 w-8 mb-2" /> : <FileText className="h-8 w-8 mb-2" />)}
  <p>No {type} submissions found</p>
</div>
      );
    }
    return (
      <ScrollArea className="mt-2 max-h-60 pr-2">
        <div className="space-y-2">
          {items.map(item => (
            <Card key={item.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {type === 'quiz' ? item.quiz_title : item.exercise_title}
                  </span>
                  {type === 'quiz' && item.score !== null ? (
                    <Badge 
                      variant={item.score >= 80 ? 'default' : 
                              item.score >= 60 ? 'secondary' : 'destructive'}
                    >
                      {item.score}%
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {type === 'quiz' ? 'Pending' : 'Submitted'}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Submitted: {item.submitted_at ? format(new Date(item.submitted_at), 'MMM d, yyyy') : 'Not submitted'}
                </div>
                {type === 'exercise' && item.grade && (
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <span>Grade:</span>
                    <Badge variant="secondary">{item.grade}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  if (loading.students) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-64" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, j) => (
                <Card key={j}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (Object.keys(studentsByCourse).length === 0 && !loading.students) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center p-6">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Students Found</h2>
        <p className="text-muted-foreground">Students will appear here once they enroll in your courses</p>
        <Button onClick={fetchStudentsGrouped}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
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
            My Students
          </h1>
          <p className="text-muted-foreground">Track and manage your students' progress</p>
        </div>
        <Button 
          onClick={fetchStudentsGrouped} 
          variant="outline" 
          disabled={loading.students}
          className="shrink-0"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading.students ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Students by Course */}
      <div className="space-y-6">
        {Object.entries(studentsByCourse).map(([courseTitle, students]) => (
          <div key={courseTitle} className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted/50 rounded-lg"
              onClick={() => toggleCourse(courseTitle)}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">{courseTitle}</h2>
                <Badge variant="secondary" className="px-2.5 py-0.5">
                  {students.length} {students.length === 1 ? 'Student' : 'Students'}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {expandedCourses[courseTitle] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedCourses[courseTitle] && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(student => (
                  <Card 
                    key={student.id} 
                    className="hover:shadow-md transition-shadow border hover:border-primary/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {student.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{student.full_name}</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{student.email}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/messages/thread?user_id=${student.id}`);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => fetchPerformance(student.id)}
                        disabled={loading.performance && selectedStudent === student.id}
                      >
                        {selectedStudent === student.id ? 'Hide Performance' : 'View Performance'}
                        {loading.performance && selectedStudent === student.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : selectedStudent === student.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {selectedStudent === student.id && performance && (
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <Card className="text-center p-3 hover:shadow-sm">
                              <CardContent className="p-0">
                                <p className="text-sm text-muted-foreground">Quiz Average</p>
                                <p className="text-xl font-bold">
                                  {typeof performance.quizAvg === 'number' ? (
                                    <span className={performance.quizAvg >= 80 ? 'text-green-600' : 
                                                    performance.quizAvg >= 60 ? 'text-amber-600' : 'text-red-600'}>
                                      {performance.quizAvg}%
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">{performance.quizAvg}</span>
                                  )}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="text-center p-3 hover:shadow-sm">
                              <CardContent className="p-0">
                                <p className="text-sm text-muted-foreground">Exercises Completed</p>
                                <p className="text-xl font-bold">
                                  {performance.exerciseCompletion.split('/')[0] === performance.exerciseCompletion.split('/')[1] ? (
                                    <span className="text-green-600">{performance.exerciseCompletion}</span>
                                  ) : (
                                    <span className="text-amber-600">{performance.exerciseCompletion}</span>
                                  )}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <Award className="h-4 w-4 text-blue-600" />
                              Quiz Submissions
                            </h4>
                            {renderSubmissionItem('quiz', performance.quizSubs)}
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              Exercise Submissions
                            </h4>
                            {renderSubmissionItem('exercise', performance.exerciseSubs)}
                          </div>
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
    </div>
  );
}