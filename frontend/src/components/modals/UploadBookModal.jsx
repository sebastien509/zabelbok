import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { enqueueOffline } from '@/utils/offlineQueue';

export default function UploadBookModal({ isOpen, onClose, courseId }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pdf_url, setPdfUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setPdfUrl('');
    setFile(null);
  };

  const handleFileUpload = async () => {
    if (!file) return toast({ title: 'No file selected', variant: 'destructive' });
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setPdfUrl(url);
      toast({ title: '✅ File uploaded to Cloudinary' });
    } catch {
      toast({ title: '❌ Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !courseId) {
      toast({
        title: 'Missing Fields',
        description: 'Title and course are required.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      title,
      author,
      pdf_url,
      course_id: parseInt(courseId),
    };

    try {
      if (navigator.onLine) {
        await api.post('/books', payload);
        toast({ title: '✅ Book uploaded online' });
      } else {
        throw new Error('Offline mode');
      }
    } catch {
      await enqueueOffline('booksQueue', payload);
      toast({ title: '📦 Book queued for sync' });
    }

    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>📘 Upload New Book</DialogTitle>
        </DialogHeader>

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
            <Label>Upload PDF File (optional)</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleFileUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
            </Button>
            {pdf_url && <p className="text-xs text-green-600">File ready: {pdf_url}</p>}
          </div>

          <div>
            <Label>or Paste PDF URL</Label>
            <Input
              type="url"
              value={pdf_url}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
            Submit Book
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
