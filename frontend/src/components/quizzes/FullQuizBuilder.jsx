// ✅ FullQuizBuilder.jsx (Unified - Supports MCQ + Short Answer + Offline + Online)
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { nanoid } from 'nanoid';

export default function FullQuizBuilder() {
  const [question, setQuestion] = useState('');
  const [answerType, setAnswerType] = useState('short'); // 'short' | 'mcq'
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [quizQueue, setQuizQueue] = useState(JSON.parse(localStorage.getItem('quizQueue') || '[]'));

  const handleSubmit = () => {
    if (!question || (answerType === 'mcq' && options.some(o => !o)) || (answerType === 'short' && !answer)) {
      toast({ title: 'Please complete all required fields', variant: 'destructive' });
      return;
    }

    const quiz = {
      id: nanoid(),
      type: answerType,
      question,
      options: answerType === 'mcq' ? options : undefined,
      correct: answerType === 'mcq' ? correct : undefined,
      answer: answerType === 'short' ? answer : undefined,
      timestamp: new Date().toISOString()
    };

    if (navigator.onLine) {
      api.post('/quizzes/create', quiz)
        .then(() => toast({ title: 'Quiz created online ✅' }))
        .catch(() => queueOffline(quiz));
    } else {
      queueOffline(quiz);
    }

    resetForm();
  };

  const queueOffline = (quiz) => {
    const updatedQueue = [...quizQueue, quiz];
    localStorage.setItem('quizQueue', JSON.stringify(updatedQueue));
    setQuizQueue(updatedQueue);
    toast({ title: 'Quiz Queued for Sync ✅' });
  };

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setOptions(['', '', '', '']);
    setCorrect(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quiz (Offline Ready)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-x-2">
          <Button variant={answerType === 'short' ? 'default' : 'outline'} onClick={() => setAnswerType('short')}>Short Answer</Button>
          <Button variant={answerType === 'mcq' ? 'default' : 'outline'} onClick={() => setAnswerType('mcq')}>Multiple Choice</Button>
        </div>

        <Input placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />

        {answerType === 'short' && (
          <Textarea placeholder="Expected Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        )}

        {answerType === 'mcq' && (
          <div className="space-y-1">
            {options.map((opt, i) => (
              <Input key={i} placeholder={`Option ${i + 1}`} value={opt} onChange={e => {
                const newOptions = [...options];
                newOptions[i] = e.target.value;
                setOptions(newOptions);
              }} />
            ))}
            <Input type="number" min="0" max="3" value={correct} onChange={e => setCorrect(Number(e.target.value))} placeholder="Correct Option Index (0-3)" />
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full">Save Quiz</Button>
      </CardContent>
    </Card>
  );
}
