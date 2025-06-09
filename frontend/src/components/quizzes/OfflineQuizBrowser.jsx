// ✅ OfflineQuizBrowser.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function OfflineQuizBrowser() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('offline_quizzes') || '[]');
    setQuizzes(stored);
  }, []);

  const handleStartQuiz = (quiz) => {
    toast({ title: `Starting Quiz: ${quiz.title}` });
    // 🟣 Here you will later open an offline quiz player
  };

  if (!quizzes.length) return <p className="text-sm text-gray-500">No offline quizzes available.</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-lg font-semibold">Offline Quizzes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz, i) => (
          <Card key={i}>
            <CardHeader><CardTitle>{quiz.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Questions: {quiz.questions.length}</p>
              <Button size="sm" onClick={() => handleStartQuiz(quiz)} className="mt-2">Start Quiz</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
