
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UploadChapterModal() {
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [content_url, setContentUrl] = useState('');
  const [bookId, setBookId] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content_url || !bookId) {
      toast({
        title: 'Missing Fields',
        description: 'All fields are required.',
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
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Upload failed.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>➕ Add Chapter to Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label>Book ID *</Label>
            <Input
              type="number"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              required
            />
          </div>
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
          <div className="flex justify-end gap-3 pt-4">
            <Button type="submit">Upload Chapter</Button>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
