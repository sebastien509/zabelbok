'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'; // ✅ utility you already use for lectures
import { Loader2 } from 'lucide-react';

export default function UploadBookModal() {
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file || !courseId) {
      toast({
        title: 'Missing Fields',
        description: 'Title, file, and Course ID are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      const pdf_url = await uploadToCloudinary(file, 'edu-books'); // folder name for books

      await api.post('/books/', {
        title,
        author,
        pdf_url,
        course_id: parseInt(courseId),
      });

      toast({ title: 'Success', description: 'Book uploaded successfully.' });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload book.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>📘 Upload a New Book Chapter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Author</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div>
            <Label>Upload PDF *</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div>
            <Label>Course ID *</Label>
            <Input
              type="number"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="submit" disabled={isUploading}>
              {isUploading ? <><Loader2 className="animate-spin mr-2 w-4 h-4" /> Uploading...</> : 'Upload Book'}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
