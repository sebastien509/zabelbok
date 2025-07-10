import { useEffect, useState } from 'react';
import { getStudentPerformance, getQuizSubmissionsByStudent, getExerciseSubmissionsByStudent, gradeQuizSubmission, gradeExerciseSubmission } from '@/services/studentPerformance';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components2/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen, BarChart2, CheckCircle, User, Mail, Award, Activity, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ProfessorTracking() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [exerciseSubmissions, setExerciseSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [grading, setGrading] = useState({});
  const { toast } = useToast();

  // Fetch student submissions when a student is selected
  const fetchStudentSubmissions = async (studentId) => {
    try {
      setLoading(true);
      const [quizSubs, exerciseSubs] = await Promise.all([
        getQuizSubmissionsByStudent(studentId),
        getExerciseSubmissionsByStudent(studentId)
      ]);
      setQuizSubmissions(quizSubs.data || []);
      setExerciseSubmissions(exerciseSubs.data || []);
    } catch (error) {
      toast({
        title: 'Error loading submissions',
        description: error.message || 'Could not load student submissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load courses from localStorage and process student data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Load courses from localStorage
        const loadedCourses = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('offline_course_')) {
            try {
              const course = JSON.parse(localStorage.getItem(key));
              if (course && course.id) {
                loadedCourses.push(course);
              }
            } catch (e) {
              console.error(`Error parsing course data for key ${key}`, e);
            }
          }
        }
        setCourses(loadedCourses);

        // Process students from all courses
        const allStudents = loadedCourses.flatMap(course => 
          (course.students || []).map(student => ({
            ...student,
            enrolled_courses: student.enrolled_courses || [{ id: course.id, title: course.title }]
          }))
        );

        // Deduplicate students while preserving all their course enrollments
        const uniqueStudentsMap = new Map();
        allStudents.forEach(student => {
          if (uniqueStudentsMap.has(student.id)) {
            // Merge course enrollments if student exists
            const existing = uniqueStudentsMap.get(student.id);
            const mergedCourses = [...(existing.enrolled_courses || []), ...(student.enrolled_courses || [])]
              .reduce((acc, course) => {
                if (!acc.some(c => c.id === course.id)) {
                  acc.push(course);
                }
                return acc;
              }, []);
            uniqueStudentsMap.set(student.id, { ...existing, enrolled_courses: mergedCourses });
          } else {
            uniqueStudentsMap.set(student.id, student);
          }
        });

        const uniqueStudents = Array.from(uniqueStudentsMap.values());

        // Enrich students with performance data
        const enrichedStudents = await Promise.all(
          uniqueStudents.map(async student => {
            try {
              const perf = await getStudentPerformance(student.id);
              return {
                ...student,
                quizAvg: perf.data.quizAvg || 'N/A',
                exercisesDone: perf.data.exerciseCompletion || '0/0',
                attendance: perf.data.attendance || '0%',
                lastActive: perf.data.lastActive || null
              };
            } catch (error) {
              console.error(`Error loading performance for student ${student.id}`, error);
              return {
                ...student,
                quizAvg: 'N/A',
                exercisesDone: '0/0',
                attendance: '0%',
                lastActive: null
              };
            }
          })
        );

        // Calculate statistics for the current filtered set
        const calculateStats = (students) => {
          const quizAvgs = students
            .map(s => parseFloat(s.quizAvg))
            .filter(avg => !isNaN(avg));
          const avgQuizScore = quizAvgs.length > 0
            ? (quizAvgs.reduce((a, b) => a + b, 0) / quizAvgs.length)
            : 0;

          const attendanceRates = students
            .map(s => parseFloat(s.attendance))
            .filter(val => !isNaN(val));
          const avgAttendance = attendanceRates.length > 0
            ? (attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length)
            : 0;

          return {
            totalStudents: students.length,
            avgQuizScore: avgQuizScore.toFixed(1),
            avgAttendance: avgAttendance.toFixed(1) + '%'
          };
        };

        setStudents(enrichedStudents);
        setStats(calculateStats(enrichedStudents));
      } catch (error) {
        toast({
          title: 'Error loading data',
          description: error.message || 'Could not load tracking data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Filter students by selected course and update stats
  const filteredStudents = selectedCourse
    ? students.filter(student => 
        student.enrolled_courses?.some(course => course.id === selectedCourse)
      )
    : students;

  // Update stats when filtered students change
  useEffect(() => {
    if (students.length > 0) {
      const quizAvgs = filteredStudents
        .map(s => parseFloat(s.quizAvg))
        .filter(avg => !isNaN(avg));
      const avgQuizScore = quizAvgs.length > 0
        ? (quizAvgs.reduce((a, b) => a + b, 0) / quizAvgs.length).toFixed(1)
        : 'N/A';

      const attendanceRates = filteredStudents
        .map(s => parseFloat(s.attendance))
        .filter(val => !isNaN(val));
      const avgAttendance = attendanceRates.length > 0
        ? (attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length).toFixed(1) + '%'
        : 'N/A';

      setStats({
        totalStudents: filteredStudents.length,
        avgQuizScore,
        avgAttendance
      });
    }
  }, [filteredStudents, students.length]);

  const handleGradeQuiz = async (submissionId, score) => {
    try {
      setGrading(prev => ({ ...prev, [submissionId]: true }));
      await gradeQuizSubmission(submissionId, { score });
      
      setQuizSubmissions(prev => prev.map(sub => 
        sub.submission_id === submissionId ? { ...sub, score } : sub
      ));
      
      toast({
        title: 'Success',
        description: 'Quiz graded successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error grading quiz',
        description: error.message || 'Failed to grade quiz',
        variant: 'destructive'
      });
    } finally {
      setGrading(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const handleGradeExercise = async (submissionId, grade) => {
    try {
      setGrading(prev => ({ ...prev, [submissionId]: true }));
      await gradeExerciseSubmission(submissionId, { grade });
      
      setExerciseSubmissions(prev => prev.map(sub => 
        sub.submission_id === submissionId ? { ...sub, grade } : sub
      ));
      
      toast({
        title: 'Success',
        description: 'Exercise graded successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error grading exercise',
        description: error.message || 'Failed to grade exercise',
        variant: 'destructive'
      });
    } finally {
      setGrading(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  // Loading state
  if (loading && !selectedStudent) {
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

  // Student detail view
  if (selectedStudent) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSelectedStudent(null)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedStudent.full_name}</h1>
            <p className="text-muted-foreground">{selectedStudent.email}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedStudent.enrolled_courses?.map(course => (
                <Badge key={course.id} variant="secondary">
                  {course.title}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* ... rest of the student detail view remains the same ... */}
        <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              <h3 className="text-sm font-medium">Quiz Average</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedStudent.quizAvg}
              {selectedStudent.quizAvg !== 'N/A' && <span className="text-base text-muted-foreground">/100</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <h3 className="text-sm font-medium">Exercises Completed</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedStudent.exercisesDone}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-medium">Attendance</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedStudent.attendance}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quizzes">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>
        <TabsContent value="quizzes">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizSubmissions.map((submission) => (
              <Card key={submission.submission_id}>
                <CardHeader>
                  <CardTitle>{submission.quiz_title}</CardTitle>
                  <CardDescription>
                    Submitted on {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Score:</span>
                      <Badge variant={submission.score >= 80 ? 'default' : submission.score >= 60 ? 'secondary' : 'destructive'}>
                        {submission.score || 'Not graded'}
                      </Badge>
                    </div>
                    {submission.feedback && (
                      <div>
                        <p className="text-sm text-muted-foreground">Feedback:</p>
                        <p className="text-sm">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="Grade (0-100)" 
                      defaultValue={submission.score || ''}
                      onChange={(e) => {
                        const newSubmissions = [...quizSubmissions];
                        const subIndex = newSubmissions.findIndex(s => s.submission_id === submission.submission_id);
                        newSubmissions[subIndex].score = e.target.value;
                        setQuizSubmissions(newSubmissions);
                      }}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleGradeQuiz(submission.submission_id, submission.score)}
                      disabled={grading[submission.submission_id]}
                    >
                      {grading[submission.submission_id] ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
            {quizSubmissions.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No quiz submissions found
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="exercises">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exerciseSubmissions.map((submission) => (
              <Card key={submission.submission_id}>
                <CardHeader>
                  <CardTitle>{submission.exercise_title}</CardTitle>
                  <CardDescription>
                    Question {submission.question_id} • Submitted on {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Answer:</p>
                    <p className="text-sm">{submission.answer_text}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Grade:</span>
                    <Badge variant={submission.grade >= 80 ? 'default' : submission.grade >= 60 ? 'secondary' : 'destructive'}>
                      {submission.grade || 'Not graded'}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="Grade (0-100)" 
                      defaultValue={submission.grade || ''}
                      onChange={(e) => {
                        const newSubmissions = [...exerciseSubmissions];
                        const subIndex = newSubmissions.findIndex(s => s.submission_id === submission.submission_id);
                        newSubmissions[subIndex].grade = e.target.value;
                        setExerciseSubmissions(newSubmissions);
                      }}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleGradeExercise(submission.submission_id, submission.grade)}
                      disabled={grading[submission.submission_id]}
                    >
                      {grading[submission.submission_id] ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
            {exerciseSubmissions.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No exercise submissions found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
            </div>
    );
  }

  // Main view
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Tracking
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Monitor student performance and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedCourse ? selectedCourse.toString() : "all"}
            onValueChange={(value) => setSelectedCourse(value === "all" ? null : parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by course" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCourse && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedCourse(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards - Now showing filtered stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow hover:border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Students</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalStudents || 0}
              {selectedCourse && (
                <span className="text-sm text-muted-foreground ml-2">
                  in {courses.find(c => c.id === selectedCourse)?.title || 'selected course'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ... other stat cards remain the same ... */}
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
              {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
              {selectedCourse && ` in ${courses.find(c => c.id === selectedCourse)?.title || ''}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Quiz Avg</TableHead>
                <TableHead>Exercises</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map(student => (
                <TableRow key={student.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{student.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {student.enrolled_courses?.slice(0, 2).map(course => (
                        <Badge 
                          key={course.id} 
                          variant={selectedCourse === course.id ? 'default' : 'outline'}
                          className="truncate"
                        >
                          {course.title}
                        </Badge>
                      ))}
                      {student.enrolled_courses?.length > 2 && (
                        <Badge variant="outline" className="px-1.5">
                          +{student.enrolled_courses.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {/* ... rest of the table cells remain the same ... */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}