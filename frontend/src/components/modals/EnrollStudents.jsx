// ✅ components/modals/EnrollStudents.jsx
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllStudents } from '@/services/auth';
import { enrollStudentsToCourse } from '@/services/courses';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EnrollStudents({ courseId, open, onClose, onSuccess }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) fetchStudents();
  }, [open]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getAllStudents();
      setStudents(res.data);
    } catch {
      toast({ title: 'Failed to fetch students', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selected.length) return toast({ title: 'Select at least one student', variant: 'destructive' });

    try {
      await enrollStudentsToCourse(courseId, selected);
      toast({ title: 'Students enrolled ✅' });
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      toast({ title: 'Failed to enroll students', variant: 'destructive' });
    }
  };

  return (
      <DialogContent className="max-w-md">
        <h2 className="text-lg font-bold mb-4">Enroll Students</h2>
        {loading ? <p>Loading students...</p> : (
          <ScrollArea className="max-h-72 mb-4">
            <ul className="space-y-2">
              {students.map(s => (
                <li key={s.id} className="flex items-center space-x-2">
                  <Checkbox id={`student-${s.id}`} checked={selected.includes(s.id)} onCheckedChange={() => handleToggle(s.id)} />
                  <label htmlFor={`student-${s.id}`} className="text-sm cursor-pointer">
                    {s.full_name} ({s.email})
                  </label>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
        <Button onClick={handleSubmit}>Enroll Selected</Button>
      </DialogContent>
  );
}
