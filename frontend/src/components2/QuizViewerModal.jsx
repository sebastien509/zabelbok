import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components2/ui/dialog';
import { Button } from '@/components2/ui/button';
import { toast } from '@/components2/ui/use-toast';

export default function QuizViewerModal({ quiz, open, onClose, onSuccess }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.questions.forEach(q => {
      const correctAnswer = q.correct_answer.trim();
      const userAnswer = answers[q.id]?.trim();
      if (correctAnswer === userAnswer) correct++;
    });

    const score = `${correct} / ${quiz.questions.length}`;
    toast('Quiz Submitted', { description: `You got ${score} correct!` });

    setSubmitted(true);
    onSuccess?.();
    onClose?.();
  };

  if (!quiz || !quiz.questions?.length) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz.title || 'Quiz'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="space-y-2 border p-4 rounded-md">
              <p className="font-medium">{i + 1}. {q.question_text}</p>
              {q.choices.map((choice, j) => (
                <label key={j} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={choice}
                    checked={answers[q.id] === choice}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    disabled={submitted}
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
          ))}
        </div>

        {!submitted && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz.questions.length}>
              Submit Quiz
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
