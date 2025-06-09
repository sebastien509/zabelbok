import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import SyncStatusBadge from '@/components/system/SyncStatusBadge';
import { useTranslation } from 'react-i18next';

export default function StudentBooks() {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get('/books');
        setBooks(response.data);
      } catch (error) {
        toast({
          title: t('failedToLoadBooks'),
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        <span className="text-sm text-gray-600">{t('loadingBooks')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center border-b p-4 bg-green-50 rounded-t-xl">
        <h2 className="text-lg font-semibold text-green-900 uppercase tracking-wide">
          {t('booksAndDocuments')}
        </h2>
        <SyncStatusBadge />
      </div>

      <div className="p-4">
        {books.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {t('noBooksAvailable')}
          </p>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)] pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map(book => (
                <div
                  key={book.id}
                  className="p-4 h-full flex flex-col justify-between bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  <div>
                    <h3 className="text-md font-bold text-green-800 truncate">
                      {book.title || t('untitledBook')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {book.description || t('noDescription')}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {book.author || t('unknownAuthor')} • {book.pages || '?'} {t('pages')}
                    </span>
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
