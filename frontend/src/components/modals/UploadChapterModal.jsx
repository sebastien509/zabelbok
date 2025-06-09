import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UploadChapterModal({ isOpen, onClose, bookId }) {
  const [title, setTitle] = useState('');
  const [content_url, setContentUrl] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content_url) {
      toast({
        title: 'Missing Fields',
        description: 'All fields required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.post(`/books/${bookId}/chapters`, {
        title,
        content_url,
      });
      toast({ title: 'Success', description: 'Chapter uploaded.' });
      setTitle('');
      setContentUrl('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Upload failed.',
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
            ➕ Add Chapter to Book #{bookId}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Chapter Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <Label>Content URL *</Label>
              <Input
                type="url"
                value={content_url}
                onChange={(e) => setContentUrl(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Upload Chapter
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
