// ✅ components/modals/ExerciseModal.jsx
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { createExerciseWithQuestions } from '@/services/exercices';
export default function ExerciseModal({ courseId, open, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });
  const [questions, setQuestions] = useState([{ question_text: '', question_url: '' }]);

  const addQuestion = () => setQuestions([...questions, { question_text: '', question_url: '' }]);

  const handleQuestionChange = (i, field, value) => {
    const updated = [...questions];
    updated[i][field] = value;
    setQuestions(updated);
  };

  const handleFileUpload = async (i, file) => {
    const url = await uploadToCloudinary(file);
    handleQuestionChange(i, 'question_url', url);
  };

  const handleSubmit = async () => {
    if (!form.title || !courseId || questions.some(q => !q.question_text)) {
      toast({ title: 'Missing required fields', variant: 'destructive' });
      return;
    }

    try {
      await createExerciseWithQuestions({
        ...form,
        course_id: courseId,
        questions
      });
      toast({ title: 'Exercise created ✅' });
      setForm({ title: '', description: '', deadline: '' });
      setQuestions([{ question_text: '', question_url: '' }]);
      onClose();
    } catch {
      toast({ title: 'Failed to create exercise', variant: 'destructive' });
    }
  };

  return (
      <DialogContent>
        <h2 className="text-lg font-bold mb-2">Add New Exercise</h2>
        <Input placeholder="Title" className="mb-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="Description" className="mb-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <Input placeholder="Deadline (YYYY-MM-DD)" className="mb-2" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />

        <h4 className="text-sm font-semibold">Questions</h4>
        {questions.map((q, i) => (
          <div key={i} className="space-y-1 mb-2">
            <Input
              placeholder={`Question ${i + 1}`}
              value={q.question_text}
              onChange={(e) => handleQuestionChange(i, 'question_text', e.target.value)}
            />
            <Input
              type="file"
              onChange={(e) => handleFileUpload(i, e.target.files[0])}
            />
            {q.question_url && <p className="text-xs text-green-600">Uploaded ✅</p>}
          </div>
        ))}

        <Button variant="outline" size="sm" className="mb-2" onClick={addQuestion}>+ Add Question</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogContent>
  );
}
