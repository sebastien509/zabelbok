import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { getPendingAssignments, getRecentThreads } from '@/services/student';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, FileText, MessageSquare, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [pendingWork, setPendingWork] = useState([]);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [userResponse, coursesRes, assignmentsRes, threadsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/courses/'),
          getPendingAssignments(),
          getRecentThreads()
        ]);

        setUser(userResponse.data);
        setCourses(coursesRes.data);
        setPendingWork(assignmentsRes.data);
        setThreads(threadsRes.data);

        document.title = userResponse.data.school_name || 'Student Dashboard';
      } catch (err) {
        setError('Failed to load dashboard data');
        toast({
          title: t('error'),
          description: t('dashboardLoadFailed'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, toast, t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Enhanced Header Section */}
      <header className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm">
        <div className="max-w-4xl mx-auto text-center">
        <h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-semibold text-blue-600 my-2 mt-4"
          >
            College Mixte Gaetan Amedée
          </h2>
          <Badge variant="secondary" className="mb-3 text-sm font-medium">
            {/* {t('studentDashboard')} */}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcomeBack')}, <span className="text-blue-600">{user.full_name}</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {user.school_name || t('schoolName')} • {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Courses Card */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/50 hover:bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">{t('yourCourses')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            {courses.length > 0 ? (
              <ul className="space-y-3">
                {courses.slice(0, 3).map(course => (
                  <li 
                    key={course.id} 
                    className="flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer group"
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {course.code || course.id}
                      </p>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors truncate">
                        {course.title}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white border-blue-100 text-blue-600">
                      {course.professor_name.split(' ')[0]}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm p-3">{t('noEnrolledCourses')}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => navigate('/student/my-courses')}
            >
              {t('viewAllCourses')}
            </Button>
          </CardFooter>
        </Card>

        {/* Pending Work Card */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/50 hover:bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">{t('pendingWork')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            {pendingWork.length > 0 ? (
              <ul className="space-y-3">
                {pendingWork.slice(0, 3).map(item => (
                  <li 
                    key={item.id} 
                    className="group flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                        {t(item.type)} • Due {format(new Date(item.deadline), 'MMM d')}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border-amber-200 text-amber-600 hover:bg-amber-50"
                      onClick={() => navigate(item.type === 'quiz' ? `/student/quiz/${item.id}` : `/exercise/${item.id}`)}
                    >
                      {t('startNow')}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm p-3">{t('noPendingWork')}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={() => navigate('/student/my-courses')}
            >
              {t('viewAllAssignments')}
            </Button>
          </CardFooter>
        </Card>

        {/* Discussions Card */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/50 hover:bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">{t('discussionThreads')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            {threads.length > 0 ? (
              <ul className="space-y-3">
                {threads.slice(0, 3).map(thread => (
                  <li 
                    key={thread.id} 
                    className="p-3 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer group"
                    onClick={() => navigate(`/discussions/${thread.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors truncate flex-1 pr-2">
                        {thread.title}
                      </p>
                      <span className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors shrink-0">
                        {format(new Date(thread.updated_at), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors truncate mt-1">
                      {thread.last_message || 'No messages yet'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm p-3">{t('noRecentThreads')}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              onClick={() => navigate('/student/message')}
            >
              {t('viewAllThreads')}
            </Button>
          </CardFooter>
        </Card>

        {/* Upcoming Deadlines - Full Width */}
        <Card className="md:col-span-2 lg:col-span-3 border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/50 hover:bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-50">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">{t('upcomingDeadlines')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {pendingWork.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pendingWork
                  .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                  .slice(0, 3)
                  .map(item => (
                    <div 
                      key={item.id} 
                      className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer hover:border-red-200 hover:bg-red-50/50 group"
                      onClick={() => navigate(item.type === 'quiz' ? `/quizzes/${item.id}` : `/exercises/${item.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors truncate">
                            {item.course_name}
                          </p>
                        </div>
                        <Badge 
                          variant={item.submitted ? 'secondary' : 'destructive'} 
                          className="shrink-0 group-hover:shadow-sm transition-shadow"
                        >
                          {format(new Date(item.deadline), 'MMM d, yyyy')}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <Button 
                          variant={item.submitted ? 'outline' : 'default'} 
                          size="sm" 
                          className={`w-full text-white ${item.submitted ? 'hover:bg-gray-50' : 'bg-red-600 hover:bg-red-700 '}`}
                        >
                          {item.submitted ? t('viewSubmission') : t('startNow')}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm p-4">{t('noDeadlines')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}