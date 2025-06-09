import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import SyncStatusBadge from '@/components/system/SyncStatusBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StudentCourses() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (error) {
        toast({
          title: t('failedToLoadCourses'),
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        <span className="text-sm text-gray-600">{t('loadingCourses')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center border-b p-4 bg-blue-50 rounded-t-xl">
        <h2 className="text-lg font-semibold text-blue-900 uppercase tracking-wide">
          {t('myCourses')}
        </h2>
        <SyncStatusBadge />
      </div>

      <div className="p-4">
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {t('noCoursesEnrolled')}
          </p>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)] pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <Link
                  key={course.id}
                  to={`/student/courses/${course.id}`}
                  className="block hover:shadow-xl transition-shadow duration-200 rounded-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-4 h-full flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
                    <div>
                      <h3 className="text-md font-bold text-blue-800 truncate">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {course.description || t('noDescription')}
                      </p>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      {t('professor')}: {course.professor_name || t('notAssigned')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
