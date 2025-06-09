import React, { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

const UploadBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title || !author || !courseId || !file) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('course_id', courseId);
    formData.append('file', file);

    try {
      await api.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Book uploaded successfully ✅' });
      navigate('/dashboard/professor'); // redirect to professor dashboard
    } catch (err) {
      toast({ title: 'Failed to upload book. Try again later.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Upload a Book</h2>
      <div className="space-y-4">
        <Input
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <Input
          placeholder="Course ID"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        />
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <Button onClick={handleSubmit}>Upload Book</Button>
      </div>
    </div>
  );
};

export default UploadBook;
