import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Loader2, X } from 'lucide-react';
import SyncStatusBadge from '@/components/system/SyncStatusBadge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

export default function StudentLectures() {
  const { t } = useTranslation();
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await api.get('/lectures/me');
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

  const handleAccess = async (url, resource) => {
    const lower = url.toLowerCase();
  
    // Check if it's a supported inline type
    const isInlineDoc = lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx');
  
    try {
      // If blob already exists (offline), use it
      if (resource.blob) {
        const blobUrl = URL.createObjectURL(resource.blob);
        if (isInlineDoc) {
          setIframeUrl(blobUrl);
        } else {
          window.open(blobUrl, '_blank');
        }
        return;
      }
  
      // If online and not yet cached, fetch and cache it
      if (navigator.onLine) {
        const res = await fetch(url);
        const blob = await res.blob();
  
        // Save blob to resource and offlineDB
        const updatedResource = { ...resource, blob };
        await offlineDB.addItem(updatedResource);
  
        const blobUrl = URL.createObjectURL(blob);
        if (isInlineDoc) {
          setIframeUrl(blobUrl);
        } else {
          window.open(blobUrl, '_blank');
        }
      } else {
        toast({
          title: 'Offline',
          description: 'File not available offline. Please open it at least once online.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Access Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        <span className="text-sm text-gray-600">{t('loadingLectures')}</span>
      </div>
    );
  }

  return (
    <>
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
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {t('course')}: {lecture.course?.title || 'N/A'}
                      </span>
                      <button
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        onClick={() => handleAccess(lecture.content_url)}
                      >
                        <ExternalLink size={16} /> {t('access')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Modal with iframe for PDF/DOC */}
      <Dialog open={!!iframeUrl} onOpenChange={() => setIframeUrl(null)}>
  <DialogContent className="p-0 overflow-hidden w-full max-w-5xl h-[90vh] max-h-[90vh]">
    <div className="absolute top-2 right-2 z-10">
      <button 
        onClick={() => setIframeUrl(null)} 
        className="text-gray-500 hover:text-red-500 bg-white/80 backdrop-blur-sm rounded-full p-1 hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
    {iframeUrl && (
      <iframe
        src={iframeUrl}
        title="Lecture Preview"
        className="w-full h-full border-none"
        allow="fullscreen"
      />
    )}
  </DialogContent>
</Dialog>
    </>
  );
}
