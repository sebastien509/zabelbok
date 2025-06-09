import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, Loader2 } from 'lucide-react';
import SyncStatusBadge from '@/components/system/SyncStatusBadge';
import { useTranslation } from 'react-i18next';

export default function StudentLectures() {
  const { t } = useTranslation();
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await api.get('/lectures');
        setLectures(response.data);
      } catch (error) {
        toast({
          title: t('failedToLoadLectures'),
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLectures();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        <span className="text-sm text-gray-600">{t('loadingLectures')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center border-b p-4 bg-blue-50 rounded-t-xl">
        <h2 className="text-lg font-semibold text-blue-900 uppercase tracking-wide">
          {t('lecturesAndMultimedia')}
        </h2>
        <SyncStatusBadge />
      </div>

      <div className="p-4">
        {lectures.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {t('noLecturesAvailable')}
          </p>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)] pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map(lecture => (
                <div
                  key={lecture.id}
                  className="p-4 h-full flex flex-col justify-between bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  <div>
                    <h3 className="text-md font-bold text-blue-800 truncate">
                      {lecture.title || t('untitledLecture')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {lecture.description || t('noDescription')}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {t('duration')}: {lecture.duration} • {t('course')}: {lecture.course?.title || 'N/A'}
                    </span>
                    <button className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      <PlayCircle size={16} /> {t('watch')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
