'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Plus, Loader2 } from 'lucide-react';
import UploadChapterModal from '@/components/modals/UploadChapterModal';
import UploadBookModal from '@/components/modals/Book';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ManageBookChapters() {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState({});
  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [loading, setLoading] = useState({
    books: false,
    chapters: {},
  });
  const { toast } = useToast();

  const fetchBooks = async () => {
    try {
      setLoading((prev) => ({ ...prev, books: true }));
      const res = await api.get('/books/');
      setBooks(res.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load books.',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, books: false }));
    }
  };

  const fetchChapters = async (bookId) => {
    try {
      setLoading((prev) => ({
        ...prev,
        chapters: { ...prev.chapters, [bookId]: true },
      }));
      const res = await api.get(`/books/${bookId}`);
      setChapters((prev) => ({ ...prev, [bookId]: res.data.chapters }));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load chapters.',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({
        ...prev,
        chapters: { ...prev.chapters, [bookId]: false },
      }));
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
          <Dialog open={showBookModal} onOpenChange={(open) => {
            setShowBookModal(open);
            if (!open) fetchBooks();
          }}>
            <DialogTrigger asChild>
              <Button className="flex gap-2">
                <Plus className="w-4 h-4" />
                Upload Book
              </Button>
            </DialogTrigger>
            {showBookModal && (
              <UploadBookModal onClose={() => setShowBookModal(false)} />
            )}
          </Dialog>
        </div>

        {loading.books ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-gray-500">No books found.</p>
            <Button onClick={() => setShowBookModal(true)}>
              Upload Your First Book
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    View PDF
                  </a>
                )}

                <div className="pt-2">
                  <Dialog
                    open={showChapterModal && selectedBookId === book.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setSelectedBookId(book.id);
                        fetchChapters(book.id);
                        setShowChapterModal(true);
                      } else {
                        setShowChapterModal(false);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Add Chapter
                      </Button>
                    </DialogTrigger>
                    {(showChapterModal && selectedBookId === book.id) && (
                      <UploadChapterModal
                        bookId={book.id}
                        onClose={() => {
                          setShowChapterModal(false);
                          fetchChapters(book.id);
                        }}
                      />
                    )}
                  </Dialog>
                </div>

                {/* Chapters */}
                {loading.chapters[book.id] ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                ) : chapters[book.id] && (
                  <ul className="pt-4 space-y-2">
                    {chapters[book.id].length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No chapters available.</p>
                    ) : (
                      chapters[book.id].map((chapter) => (
                        <li
                          key={chapter.id}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{chapter.title}</p>
                            <a
                              href={chapter.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 underline hover:text-blue-700"
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
