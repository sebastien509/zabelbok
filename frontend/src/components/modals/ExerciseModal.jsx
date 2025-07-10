import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { api } from '@/services/api';
import { enqueueOffline } from '@/services/offlineQueue';

export default function ExerciseModal({ courseId, exercise, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: exercise?.title || '',
    description: exercise?.description || '',
    deadline: exercise?.deadline || '',
  });

  const [questions, setQuestions] = useState(
    exercise?.questions || [{ question_text: '', question_url: '' }]
  );

  const addQuestion = () =>
    setQuestions([...questions, { question_text: '', question_url: '' }]);

  const handleQuestionChange = (i, field, value) => {
    const updated = [...questions];
    updated[i][field] = value;
    setQuestions(updated);
  };

  const handleFileUpload = async (i, file) => {
    try {
      const url = await uploadToCloudinary(file);
      handleQuestionChange(i, 'question_url', url);
      toast({ title: '✅ File uploaded' });
    } catch {
      toast({ title: '❌ Failed to upload file', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !courseId || questions.some(q => !q.question_text)) {
      toast({ title: 'Missing required fields', variant: 'destructive' });
      return;
    }
  
    const payload = {
      ...form,
      course_id: parseInt(courseId),
      questions,
    };
  
    try {
      if (navigator.onLine) {
        if (exercise) {
          // Update existing exercise
          await api.put(`/exercises/${exercise.id}`, payload);
          toast({ title: '✅ Exercise updated' });
        } else {
          // Create new exercise
          await api.post('/exercises/full', payload);
          toast({ title: '✅ Exercise created' });
        }
      } else {
        throw new Error('Offline');
      }
    } catch {
      await enqueueOffline('exercisesQueue', payload);
      toast({ title: '📦 Exercise queued for sync' });
    }
  
    setForm({ title: '', description: '', deadline: '' });
    setQuestions([{ question_text: '', question_url: '' }]);
    onSuccess?.();
    onClose();
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="text-lg font-bold mb-2">
          {exercise ? '✏️ Edit Exercise' : '📝 Add New Exercise'}
        </DialogTitle>

        <Input
          placeholder="Title"
          className="mb-2"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <Input
          placeholder="Description"
          className="mb-2"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <Input
          type="date"
          placeholder="Deadline"
          className="mb-4"
          value={form.deadline}
          onChange={e => setForm({ ...form, deadline: e.target.value })}
        />

        <h4 className="text-sm font-semibold">Questions</h4>
        {questions.map((q, i) => (
          <div key={i} className="space-y-2 mb-4 border-b pb-4">
            <Input
              placeholder={`Question ${i + 1}`}
              value={q.question_text}
              onChange={(e) =>
                handleQuestionChange(i, 'question_text', e.target.value)
              }
            />
            <Input
              type="file"
              accept="application/pdf,image/*,audio/*,video/*"
              onChange={(e) => handleFileUpload(i, e.target.files[0])}
            />
            {q.question_url && (
              <p className="text-xs text-green-600 break-all">Uploaded ✅</p>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={addQuestion}
        >
          + Add Question
        </Button>

        <Button className="w-full" onClick={handleSubmit}>
          {exercise ? 'Update Exercise' : 'Submit Exercise'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}