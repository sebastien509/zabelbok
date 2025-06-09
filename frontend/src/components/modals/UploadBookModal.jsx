import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UploadBook from '../uploads/UploadBook';

export default function UploadBookModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pdf_url, setPdfUrl] = useState('');
  const [course_id, setCourseId] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !course_id) {
      toast({
        title: 'Missing Fields',
        description: 'Title and Course ID are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.post('/books', {
        title,
        author,
        pdf_url,
        course_id: parseInt(course_id),
      });
      toast({ title: 'Success', description: 'Book uploaded successfully.' });
      setTitle('');
      setAuthor('');
      setPdfUrl('');
      setCourseId('');
      onClose(); // close modal
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload book.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
          <Dialog.Title className="text-xl font-bold text-blue-700">
            📘 Upload a New Book
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <Label>Author</Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>

            <div>
              <Label>PDF URL</Label>
              <Input type="url" value={pdf_url} onChange={(e) => setPdfUrl(e.target.value)} />
            </div>

            <div>
              <Label>Course ID *</Label>
              <Input
                type="number"
                value={course_id}
                onChange={(e) => setCourseId(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Upload Book
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

