import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Plus } from 'lucide-react';
import UploadChapterModal from '@/components/modals/UploadChapterModal';
import UploadBookModal from '@/components/modals/Book';

export default function ManageBookChapters() {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState({});
  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const toast = useToast();

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load books.',
        variant: 'destructive',
      });
    }
  };

  const fetchChapters = async (bookId) => {
    try {
      const res = await api.get(`/books/${bookId}`);
      setChapters((prev) => ({ ...prev, [bookId]: res.data.chapters }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load chapters.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenChapterModal = (bookId) => {
    setSelectedBookId(bookId);
    fetchChapters(bookId);
    setShowChapterModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-10"
    >
      <div className="max-w-screen-lg mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-blue-700">📚 Manage Books & Chapters</h1>
          <Button onClick={() => setShowBookModal(true)} className="flex gap-2">
            <Plus className="w-4 h-4" />
            Upload Book
          </Button>
        </div>

        {books.length === 0 ? (
          <p className="text-center text-gray-500">No books found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white/90 backdrop-blur-md border shadow-md rounded-xl p-6 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{book.title}</h2>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500 mt-1">Course ID: {book.course_id}</p>
                  </div>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>

                {book.pdf_url && (
                  <a
                    href={book.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    View PDF
                  </a>
                )}

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOpenChapterModal(book.id)}
                  >
                    Add Chapter
                  </Button>
                </div>

                {/* Chapters */}
                {chapters[book.id] && (
                  <ul className="pt-4 space-y-2">
                    {chapters[book.id].length === 0 ? (
                      <p className="text-sm text-gray-400">No chapters available.</p>
                    ) : (
                      chapters[book.id].map((chapter) => (
                        <li
                          key={chapter.id}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
                        >
                          <div>
                            <p className="font-medium">{chapter.title}</p>
                            <a
                              href={chapter.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 underline"
                            >
                              View Chapter
                            </a>
                          </div>
                          <FileText className="w-4 h-4 text-gray-400" />
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        <UploadBookModal
          isOpen={showBookModal}
          onClose={() => {
            setShowBookModal(false);
            fetchBooks();
          }}
        />
        <UploadChapterModal
          isOpen={showChapterModal}
          onClose={() => {
            setShowChapterModal(false);
            fetchChapters(selectedBookId);
          }}
          bookId={selectedBookId}
        />
      </div>
    </motion.div>
  );
}
