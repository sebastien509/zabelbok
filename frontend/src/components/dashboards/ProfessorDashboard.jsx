import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import {
  getMyCourses,
  getLatestSubmissions,
  getRecentThreads,
} from '@/services/professor';
import { getNotifications } from '@/services/notification';
import { getCourseAnalytics } from '@/services/analytics';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  MessageSquare,
  BookOpen,
  FileText,
  BarChart2,
  Bell,
  ChevronRight,
  User,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

export default function ProfessorDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [threads, setThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);

        const [
          coursesRes,
          submissionsRes,
          threadsRes,
          notificationsRes,
          analyticsRes,
        ] = await Promise.all([
          getMyCourses(),
          getLatestSubmissions(),
          getRecentThreads(),
          getNotifications(),
          getCourseAnalytics(),
        ]);

        setCourses(coursesRes.data);
        setSubmissions(submissionsRes.data);
        setThreads(threadsRes.data);
        setNotifications(notificationsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        toast({
          title: t('error'),
          description: t('dashboardLoadFailed'),
          variant: 'destructive',
        });
        console.error('Dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, t, toast]);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
        </motion.div>
      </motion.div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-8"
    >
      {/* Background Blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <motion.div className="container mx-auto">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-semibold text-white my-6 mt-4"
          >
            College Mixte Gaetan Amedée
          </motion.h2>
            <div className="absolute flex-row -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex row justify-center mb-4"
            >
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <User className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {t('welcome')}, <span className="text-yellow-200">{user.full_name}</span>
            </h1>
            <p className="text-blue-100 mb-4">{t('professorDashboard')}</p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{currentDateTime.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{currentDateTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
         
        </motion.header>
   

        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

  {/* Courses Card */}
  <motion.div whileHover={{ y: -5 }}>
    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all border border-white/20 rounded-2xl overflow-hidden">
      <div className="bg-blue-50 h-2 w-full"></div>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          {t('yourCourses')}
        </CardTitle>
        <Badge variant="secondary">{courses.length} {t('active')}</Badge>
      </CardHeader>
      <CardContent>
        {courses.length > 0 ? (
          <ul className="space-y-3">
            {courses.slice(0, 3).map((course) => (
              <motion.li 
                key={course.course_id}
                whileHover={{ x: 5 }}
                className="flex justify-between items-center p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span className="font-medium truncate">
                  {course.title}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {course.student_count} {t('students')}
                  </Badge>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">{t('noCoursesAssigned')}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          onClick={() => navigate('/courses')}
        >
          {t('manageCourses')}
        </Button>
      </CardFooter>
    </Card>
  </motion.div>

  {/* Submissions Card */}
  <motion.div whileHover={{ y: -5 }}>
    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all border border-white/20 rounded-2xl overflow-hidden">
      <div className="bg-green-50 h-2 w-full"></div>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          {t('recentSubmissions')}
        </CardTitle>
        <Badge variant="secondary">{submissions.length} {t('new')}</Badge>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <ul className="space-y-3">
            {submissions.slice(0, 3).map((sub) => (
              <motion.li 
                key={sub.id}
                whileHover={{ x: 5 }}
                className="flex justify-between items-center p-2 hover:bg-green-50 rounded-lg transition-colors"
              >
                <div className="truncate">
                  <p className="font-medium truncate">
                    {sub.student_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {sub.quiz_title || sub.assignment_title}
                  </p>
                </div>
                <Badge variant={sub.graded ? 'default' : 'secondary'} className="shrink-0">
                  {sub.graded ? sub.score : t('pending')}
                </Badge>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">{t('noRecentSubmissions')}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full border-green-200 hover:bg-green-50 hover:text-green-600"
          onClick={() => navigate('/tracking')}
        >
          {t('gradeSubmissions')}
        </Button>
      </CardFooter>
    </Card>
  </motion.div>

  

          {/* Threads Card */}
        
<motion.div whileHover={{ y: -5 }}>
  <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all border border-white/20 rounded-2xl overflow-hidden">
    <div className="bg-purple-50 h-2 w-full"></div>
    <CardHeader className="flex items-center justify-between pb-2">
      <CardTitle className="text-lg font-medium flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-purple-600" />
        {t('recentMessages')}
      </CardTitle>
      <Badge variant="secondary">{threads.length} {t('unread')}</Badge>
    </CardHeader>
    <CardContent>
      {threads.length > 0 ? (
        <ul className="space-y-3">
          {threads.slice(0, 3).map((thread) => (
            <motion.li 
              key={thread.id}
              whileHover={{ x: 5 }}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-1.5 rounded-full mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{thread.sender_name}</p>
                  <p className="text-sm text-gray-500 truncate">{thread.last_message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(thread.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">{t('noRecentThreads')}</p>
      )}
    </CardContent>
    <CardFooter>
      <Button 
        variant="outline" 
        className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-600"
        onClick={() => navigate('/discussions')}
      >
        {t('viewMessages')}
      </Button>
    </CardFooter>
  </Card>
</motion.div>

          {/* Notifications Card */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all border border-white/20 rounded-2xl">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{t('notifications')}</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <ul className="space-y-3">
                    {notifications.slice(0, 4).map((n) => (
                      <motion.li 
                        key={n.id}
                        whileHover={{ x: 5 }}
                        className="flex flex-col gap-1 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-sm">{n.message}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">{t('noNotifications')}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => navigate('/notifications')}
                >
                  {t('viewAllNotifications')}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Analytics Card */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="md:col-span-2 lg:col-span-3"
          >
            <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all border border-white/20 rounded-2xl">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{t('courseAnalytics')}</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart2 className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                {analytics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {analytics.slice(0, 4).map((course) => (
                      <motion.div
                        key={course.course_id}
                        whileHover={{ scale: 1.02 }}
                        className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-all"
                      >
                        <h3 className="font-semibold text-gray-700 mb-2">
                          {course.course_name}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 p-1 rounded-lg">
                              <BarChart2 className="h-4 w-4 text-blue-600" />
                            </span>
                            <span>{t('avgGrade')}: <span className="font-medium">{course.average_grade || 'N/A'}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-green-100 p-1 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span>{t('completionRate')}: <span className="font-medium">{course.completion_rate}%</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-100 p-1 rounded-lg">
                              <FileText className="h-4 w-4 text-purple-600" />
                            </span>
                            <span>{t('submissions')}: <span className="font-medium">{course.submission_count}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-yellow-100 p-1 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                            </span>
                            <span>{t('enrolled')}: <span className="font-medium">{course.student_count}</span></span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t('noAnalytics')}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
                  </motion.div>

    </motion.div>
  );
}



