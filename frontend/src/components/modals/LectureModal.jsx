// ✅ components/modals/LectureModal.jsx
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { createLecture } from '@/services/lectures';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';

export default function LectureModal({ open, onClose, courseId, onSuccess }) {
  const [form, setForm] = useState({ title: '', content_url: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast({ title: 'No file selected', variant: 'destructive' });
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, content_url: url }));
      toast({ title: 'File uploaded successfully ✅' });
    } catch {
      toast({ title: 'Failed to upload file', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content_url || !courseId) {
      return toast({ title: 'Title, file, and course are required', variant: 'destructive' });
    }
    try {
      await createLecture({ ...form, course_id: parseInt(courseId) });
      toast({ title: 'Lecture created ✅' });
      setForm({ title: '', content_url: '' });
      setFile(null);
      onSuccess?.();
      onClose();
    } catch {
      toast({ title: 'Failed to create lecture', variant: 'destructive' });
    }
  };

  return (
      <DialogContent>
        <h2 className="text-lg font-bold mb-2">Add New Lecture</h2>
        <Input
          placeholder="Lecture Title"
          className="mb-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          type="file"
          className="mb-2"
          accept="audio/*,video/*,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <Button onClick={handleUpload} disabled={uploading || !file} className="mb-3">
          {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
        </Button>
        {form.content_url && <p className="text-xs text-green-600">Uploaded: {form.content_url}</p>}
        <Button onClick={handleSubmit}>Create Lecture</Button>
      </DialogContent>
  );
}
