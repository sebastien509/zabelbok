// ✅ QuizDraftManager.jsx (Upgraded with Step-by-Step Builder + Previewer)
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function QuizDraftManager() {
  const [drafts, setDrafts] = useState([]);
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('quizQueue') || '[]');
    setDrafts(stored);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && drafts.length > 0) {
        drafts.forEach((quiz, i) => handleSync(quiz, i, false));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [drafts]);

  const handleSync = async (quiz, index, notify = true) => {
    try {
      await api.post('/quizzes/create', quiz);
      const updated = [...drafts];
      updated.splice(index, 1);
      localStorage.setItem('quizQueue', JSON.stringify(updated));
      setDrafts(updated);
      if (notify) toast({ title: 'Quiz synced successfully ✅' });
    } catch {
      if (notify) toast({ title: 'Failed to sync quiz ❌', variant: 'destructive' });
    }
  };

  const handleSaveDraft = () => {
    if (!question || options.some(o => !o)) return toast({ title: 'Fill all fields', variant: 'destructive' });
    const quiz = { id: Date.now(), question, options, correct, type: 'mcq', timestamp: new Date().toISOString() };
    const updated = [...drafts, quiz];
    localStorage.setItem('quizQueue', JSON.stringify(updated));
    setDrafts(updated);
    toast({ title: 'Quiz Saved Offline ✅' });
    resetForm();
  };

  const resetForm = () => {
    setStep(0);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrect(0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Quiz Draft Manager</CardTitle>
          {drafts.length > 0 && <Badge>{drafts.length} drafts</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 0 && (
          <Button onClick={() => setStep(1)}>+ Create New Quiz</Button>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <Textarea placeholder="Quiz Question" value={question} onChange={e => setQuestion(e.target.value)} />
            {options.map((opt, i) => (
              <Input key={i} placeholder={`Option ${i + 1}`} value={opt} onChange={e => {
                const newOpts = [...options];
                newOpts[i] = e.target.value;
                setOptions(newOpts);
              }} />
            ))}
            <Input type="number" min="0" max="3" value={correct} onChange={e => setCorrect(Number(e.target.value))} placeholder="Correct Option Index (0-3)" />
            <div className="flex gap-2">
              <Button onClick={() => setPreviewing(true)}>Preview</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        )}

        {previewing && (
          <Card className="p-2">
            <CardTitle>Preview</CardTitle>
            <CardContent>
              <p><strong>Q:</strong> {question}</p>
              <ul className="list-disc pl-4">
                {options.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
              <p className="text-sm text-gray-500">Correct Option: {correct + 1}</p>
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSaveDraft}>Save Draft</Button>
                <Button variant="outline" onClick={() => setPreviewing(false)}>Edit</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {drafts.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Existing Drafts</h3>
            {drafts.map((quiz, i) => (
              <div key={quiz.id} className="border p-2 rounded space-y-1">
                <p className="font-medium">{quiz.question}</p>
                <p className="text-xs text-gray-500">Saved: {new Date(quiz.timestamp).toLocaleString()}</p>
                <Button onClick={() => handleSync(quiz, i)} size="sm">Sync Now</Button>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}