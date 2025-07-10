import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { Loader2, File, UploadCloud, X } from 'lucide-react';
import { createLecture, updateLecture, getLecture } from '@/services/lectures';
import { api } from '@/services/api';
import { enqueueOffline } from '@/utils/offlineQueue';

export default function LectureModal({ 
  open, 
  onClose, 
  courseId, 
  lectureId, 
  onSuccess,
  children 
}) {
  const [form, setForm] = useState({ title: '', content_url: '', course_id: courseId || '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lectureId) {
      setLoading(true);
      getLecture(lectureId)
        .then(res => {
          setForm({
            title: res.data.title,
            content_url: res.data.content_url,
            course_id: res.data.course_id
          });
        })
        .catch(error => {
          toast({
            title: 'Error loading lecture',
            description: error.message,
            variant: 'destructive'
          });
        })
        .finally(() => setLoading(false));
    } else {
      setForm({ title: '', content_url: '', course_id: courseId || '' });
    }
  }, [lectureId, courseId]);

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({ title: 'File too large (max 100MB)', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, content_url: url }));
      toast({ title: '✅ File uploaded successfully' });
    } catch (error) {
      toast({ 
        title: '❌ Upload failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content_url || !form.course_id) {
      toast({ 
        title: 'Missing fields', 
        description: 'All fields are required', 
        variant: 'destructive' 
      });
      return;
    }

    const payload = {
      title: form.title,
      content_url: form.content_url,
      course_id: form.course_id
    };

    try {
      if (lectureId) {
        await updateLecture(lectureId, payload);
        toast({ title: '✅ Lecture updated successfully' });
      } else {
        if (navigator.onLine) {
          await createLecture(payload);
          toast({ title: '✅ Lecture created successfully' });
        } else {
          await enqueueOffline('lecturesQueue', payload);
          toast({ title: '📦 Lecture queued for sync' });
        }
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error saving lecture',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {lectureId ? 'Edit Lecture' : 'Upload New Lecture'}
          </DialogTitle>
          <DialogDescription>
            {lectureId ? 'Update your lecture details' : 'Add a new lecture to your course'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lecture Title</Label>
              <Input
                id="title"
                placeholder="Introduction to React"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Lecture Content</Label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  accept="audio/*,video/*,application/pdf,image/*,.doc,.docx,.ppt,.pptx,.txt,.zip"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="mr-2 h-4 w-4" />
                  )}
                  Upload
                </Button>
              </div>
              {form.content_url && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                  <File className="h-4 w-4" />
                  <span className="truncate">File uploaded successfully</span>
                  <button 
                    onClick={() => setForm(prev => ({ ...prev, content_url: '' }))}
                    className="ml-auto text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Or paste URL manually</Label>
              <Input
                type="url"
                placeholder="https://example.com/lecture.pdf"
                value={form.content_url}
                onChange={(e) => setForm({ ...form, content_url: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => onClose()}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!form.title || !form.content_url || !form.course_id}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {lectureId ? 'Save Changes' : 'Create Lecture'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}