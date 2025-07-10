import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { enqueueOffline } from '@/utils/offlineQueue';
import { nanoid } from 'nanoid';

export default function FullQuizBuilder({ courseId, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: nanoid(),
      type: 'short',
      question_text: '',
      answer: '',
      choices: ['', '', '', ''],
      correct_answer: '',
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: nanoid(),
        type: 'short',
        question_text: '',
        answer: '',
        choices: ['', '', '', ''],
        correct_answer: '',
      },
    ]);
  };

  const removeQuestion = (id) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id, key, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const handleChoiceChange = (qid, idx, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qid) {
          const updated = [...q.choices];
          updated[idx] = value;
          return { ...q, choices: updated };
        }
        return q;
      })
    );
  };

  const validateQuiz = () => {
    if (!title || !courseId) {
      toast({
        title: 'Missing fields',
        description: 'Quiz title and course ID are required.',
        variant: 'destructive',
      });
      return false;
    }

    const valid = questions.every((q) => {
      if (!q.question_text) return false;
      if (q.type === 'short') return !!q.answer;
      if (q.type === 'mcq') {
        const filledChoices = q.choices.filter((c) => c.trim()).length >= 2;
        return filledChoices && q.correct_answer;
      }
      return true;
    });

    if (!valid) {
      toast({
        title: 'Validation error',
        description: 'Make sure all questions are fully filled.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateQuiz()) return;

    const payload = {
      title,
      description,
      deadline,
      course_id: parseInt(courseId),
      questions: questions.map((q) => ({
        question_text: q.question_text,
        choices: q.type === 'mcq' ? q.choices : [],
        correct_answer: q.type === 'mcq' ? q.correct_answer : q.answer,
      })),
    };

    try {
      if (navigator.onLine) {
        await api.post('/quizzes/full', payload);
        toast({ title: 'Quiz created ✅' });
      } else {
        throw new Error('Offline');
      }
    } catch {
      await enqueueOffline('quizQueue', payload);
      toast({ title: '📦 Quiz queued for sync' });
    }

    setTitle('');
    setDescription('');
    setDeadline('');
    setQuestions([
      {
        id: nanoid(),
        type: 'short',
        question_text: '',
        answer: '',
        choices: ['', '', '', ''],
        correct_answer: '',
      },
    ]);
    onClose?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quiz (Offline Ready)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        {questions.map((q, i) => (
          <div key={q.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <Label>Question {i + 1}</Label>
              {questions.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeQuestion(q.id)}
                >
                  Remove
                </Button>
              )}
            </div>

            <Input
              placeholder="Question text"
              value={q.question_text}
              onChange={(e) =>
                handleQuestionChange(q.id, 'question_text', e.target.value)
              }
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={q.type === 'short' ? 'default' : 'outline'}
                onClick={() => handleQuestionChange(q.id, 'type', 'short')}
              >
                Short Answer
              </Button>
              <Button
                size="sm"
                variant={q.type === 'mcq' ? 'default' : 'outline'}
                onClick={() => handleQuestionChange(q.id, 'type', 'mcq')}
              >
                Multiple Choice
              </Button>
            </div>

            {q.type === 'short' && (
              <Input
                placeholder="Expected answer"
                value={q.answer}
                onChange={(e) =>
                  handleQuestionChange(q.id, 'answer', e.target.value)
                }
              />
            )}

            {q.type === 'mcq' && (
              <div className="space-y-1">
                {[0, 1, 2, 3].map((idx) => (
                  <Input
                    key={idx}
                    placeholder={`Option ${idx + 1}`}
                    value={q.choices[idx]}
                    onChange={(e) =>
                      handleChoiceChange(q.id, idx, e.target.value)
                    }
                  />
                ))}
                <Input
                  placeholder="Correct Answer Text"
                  value={q.correct_answer}
                  onChange={(e) =>
                    handleQuestionChange(q.id, 'correct_answer', e.target.value)
                  }
                />
              </div>
            )}
          </div>
        ))}

        <Button variant="outline" onClick={addQuestion}>
          + Add Question
        </Button>
        <Button className="w-full" onClick={handleSubmit}>
          Submit Quiz
        </Button>
      </CardContent>
    </Card>
  );
}
