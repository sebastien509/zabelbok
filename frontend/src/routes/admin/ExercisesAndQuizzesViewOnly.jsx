// ✅ ExercisesAndQuizzesViewOnly.jsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ExercisesAndQuizzesViewOnly() {
  const [exercises, setExercises] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    api.get('/exercises').then(res => setExercises(res.data));
    api.get('/quizzes').then(res => setQuizzes(res.data));
  }, []);

  return (
    <Tabs defaultValue="exercises" className="p-4">
      <TabsList className="mb-4">
        <TabsTrigger value="exercises">Exercises</TabsTrigger>
        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
      </TabsList>

      <TabsContent value="exercises">
        <div className="grid gap-4">
          {exercises.map(e => (
            <Card key={e.id}>
              <CardHeader><CardTitle>{e.title}</CardTitle></CardHeader>
              <CardContent><p className="text-sm">Deadline: {e.deadline}</p></CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="quizzes">
        <div className="grid gap-4">
          {quizzes.map(q => (
            <Card key={q.id}>
              <CardHeader><CardTitle>{q.title}</CardTitle></CardHeader>
              <CardContent><p className="text-sm">Deadline: {q.deadline}</p></CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}