import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import SyncStatusBadge from './SyncStatusBadge';
import OfflineStatusPanel from './OfflineStatusPanel';
import { routes } from '@/routes/routes';
import { Menu, X, LogOut, BookOpen } from 'lucide-react';
import { api } from '@/services/api';
import { getAllCourses } from '@/services/courses';
import LanguageSwitcher from '@/languageSwitcher';
import NotificationBell from '../notification/NotificationBell';
import { useNotification } from '@/context/NotificationContext';
import { useTranslation, Trans } from 'react-i18next';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const { unreadCount } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.clear();
          navigate('/login');
        });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await getAllCourses();
        setCourses(response.data);
        setCoursesError(null);
      } catch (error) {
        setCoursesError(t('error.loadingCourses'));
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [t]);

  const handleLogout = () => {
    localStorage.clear();
    toast({ title: t('logout.success') });
    navigate('/login');
  };

  const NavLink = ({ to, label, icon: Icon }) => {
    const isDynamic = to.includes('/:');
    let isActive = false;

    if (isDynamic) {
      const basePath = to.split('/:')[0];
      isActive = location.pathname.startsWith(basePath);
    } else {
      isActive = location.pathname === to;
    }

    return (
      <Link
        to={to}
        className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-200 ${
          isActive ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'
        }`}
        onClick={() => setIsOpen(false)}
      >
        {Icon && <Icon size={16} />}
        <span>{typeof label === 'string' ? t(label) : label}</span>
      </Link>
    );
  };

  const renderCourseLinks = () => {
    if (!user) return null;

    if (isLoadingCourses) {
      return <div className="pl-4 py-2 text-sm text-gray-500">{t('loadingCourses')}</div>;
    }

    if (coursesError) {
      return <div className="pl-4 py-2 text-sm text-red-500">{coursesError}</div>;
    }

    if (courses.length === 0) {
      return <div className="pl-4 py-2 text-sm text-gray-500">{t('noCourses')}</div>;
    }

    const basePath = user.role === 'student' ? '/student/courses' : '/courses';
    const filteredCourses = user.role === 'professor' 
      ? courses.filter(course => course.professor_id === user.id)
      : courses;

    return (
      <div className="pl-2 space-y-1">
        <div className="text-xs font-semibold text-gray-500 px-2 py-1">{t('myCourses')}</div>
        {filteredCourses.map((course, index) => (
          <NavLink 
            key={`${course.id}-${index}`} 
            to={`${basePath}/${course.id}`} 
            label={course.title}
            icon={BookOpen}
          />
        ))}
      </div>
    );
  };

  const roleRoutes = user ? (routes[user.role] || []).map(route => ({ ...route, label: t(route.label) })) : [];
  const sharedRoutes = (routes.shared || []).map(route => ({ ...route, label: t(route.label) }));

  // const offlinePaths = {
  //   student: '/offline/student',
  //   professor: '/offline/professor',
  //   admin: '/offline/admin'
  // };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden p-2 m-2 fixed top-2 left-2 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out backdrop-blur-sm bg-opacity-80 hover:bg-opacity-100"
        aria-label="Toggle navigation"
      >
        {isOpen ? (
          <X size={20} className="text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu size={20} className="text-gray-700 dark:text-gray-300" />
        )}
      </button>

      <aside className={`flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 h-screen fixed md:static z-30 shadow-lg transition-all duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>

        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 backdrop-blur-sm bg-opacity-90">
          <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Haiti Edu Platform
          </h2>
          <SyncStatusBadge className="transform hover:scale-110 transition-transform" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">

          <div className="flex items-center justify-between px-1 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <NotificationBell className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors" />
            <NavLink
              to="/notifications"
              label={<Trans>notifications</Trans>}
              className="hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md px-3 py-2 transition-colors"
            />
          </div>


          <nav className="space-y-1.5">
          {renderCourseLinks()}

            {roleRoutes.map((r, i) => {
              if (r.path.includes('/courses/') || r.path.includes('/student/courses/')) return null;
              return (
                <NavLink 
                  key={`role-${i}`} 
                  to={r.path} 
                  label={r.label}
                />
              );
            })}


            {sharedRoutes.map((r, i) => (
              <NavLink 
                key={`shared-${i}`} 
                to={r.path} 
                label={r.label}
              />
            ))}

            {/* {user?.role && ( */}
              {/* /* <NavLink 
                to={offlinePaths[user.role]} 
                label={t('offlineContent')}
                icon={BookOpen}
              />
            )} */}
          </nav> 

          <div className="mt-6 px-1">
            <p className="text-xs text-gray-500 mb-1">🌐 {t('language')}</p>
            <LanguageSwitcher className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-1.5 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors" />
          </div>

          {user && (
            <div className="mt-6 text-sm border-t border-gray-200 dark:border-gray-700 pt-3 px-1">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {user.full_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/40 dark:hover:to-red-900/30 flex items-center justify-center space-x-2 border border-red-200 dark:border-red-800 transition-all duration-200 hover:shadow-sm hover:translate-y-[-1px] active:translate-y-0"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 z-20 md:hidden backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
