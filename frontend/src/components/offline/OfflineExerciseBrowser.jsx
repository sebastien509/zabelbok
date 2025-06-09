// ✅ OfflineExerciseBrowser.jsx (Polished + Animations + Optional Clear)
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OfflineExerciseBrowser() {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('exerciseQueue') || '[]');
    setExercises(stored);
  }, []);

  const clearOne = (index) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
    localStorage.setItem('exerciseQueue', JSON.stringify(updated));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardHeader>
          <CardTitle>Offline Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <p className="text-muted-foreground text-sm">No offline exercises found.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {exercises.map((ex, i) => (
                <motion.li key={i} layout className="border rounded p-2 space-y-1">
                  <p><strong>Exercise ID:</strong> {ex.exercise_id}</p>
                  <p><strong>Answer:</strong> {ex.answer_text}</p>
                  <p><strong>Status:</strong> {ex.synced ? '✅ Synced' : '⏳ Pending'}</p>
                  <Button variant="outline" size="xs" onClick={() => clearOne(i)}>Remove</Button>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
