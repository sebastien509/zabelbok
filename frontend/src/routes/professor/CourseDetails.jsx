import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, ClipboardList, File, Users, Calendar, Clock, Bookmark, Award, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (error) {
        toast({ 
          title: 'Failed to load course', 
          description: error.message, 
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-9 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <BookOpen className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold text-red-600">Course not found</h2>
        <p className="text-muted-foreground">The requested course could not be loaded</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Course Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {course.title}
          </h1>
          <p className="text-muted-foreground">
            {course.code} • Taught by {course.professor_name || 'Professor'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bookmark className="mr-2 h-4 w-4" />
            Save Course
          </Button>
          <Button>
            <GraduationCap className="mr-2 h-4 w-4" />
            Manage Students
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <h3 className="text-sm font-medium">Enrolled Students</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.students?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <ClipboardList className="h-4 w-4" />
              <h3 className="text-sm font-medium">Active Assignments</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(course.quizzes?.length || 0) + (course.exercises?.length || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <h3 className="text-sm font-medium">Learning Materials</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(course.lectures?.length || 0) + (course.books?.length || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Details with Tabs */}
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="rounded-b-none"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'content' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('content')}
          className="rounded-b-none"
        >
          Course Content
        </Button>
        <Button
          variant={activeTab === 'students' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('students')}
          className="rounded-b-none"
        >
          Students
        </Button>
      </div>

      <ScrollArea className="space-y-6 max-h-[60vh]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Course Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {course.description || 'No description available'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Start Date</h3>
                    <p>{course.start_date ? format(new Date(course.start_date), 'MMMM d, yyyy') : 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">End Date</h3>
                    <p>{course.end_date ? format(new Date(course.end_date), 'MMMM d, yyyy') : 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Lectures
                  <Badge variant="secondary" className="ml-2">
                    {course.lectures?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.lectures?.length > 0 ? (
                  <ul className="space-y-3">
                    {course.lectures.map(lecture => (
                      <li key={lecture.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span>{lecture.title}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No lectures available</p>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  Books & Materials
                  <Badge variant="secondary" className="ml-2">
                    {course.books?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.books?.length > 0 ? (
                  <ul className="space-y-3">
                    {course.books.map(book => (
                      <li key={book.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{book.title}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No books available</p>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-green-600" />
                  Quizzes
                  <Badge variant="secondary" className="ml-2">
                    {course.quizzes?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.quizzes?.length > 0 ? (
                  <ul className="space-y-3">
                    {course.quizzes.map(quiz => (
                      <li key={quiz.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>{quiz.title}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button size="sm">
                            View Results
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No quizzes assigned</p>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Exercises
                  <Badge variant="secondary" className="ml-2">
                    {course.exercises?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.exercises?.length > 0 ? (
                  <ul className="space-y-3">
                    {course.exercises.map(ex => (
                      <li key={ex.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{ex.title}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button size="sm">
                            View Submissions
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No exercises assigned</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Enrolled Students
                <Badge variant="secondary" className="ml-2">
                  {course.students?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.students?.length > 0 ? (
                <div className="space-y-4">
                  {course.students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {student.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Progress
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <Users className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No students enrolled</h3>
                  <p className="text-muted-foreground">Students will appear here once they enroll</p>
                  <Button className="mt-2">
                    Invite Students
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
}