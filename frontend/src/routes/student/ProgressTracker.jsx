import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { Bar } from 'react-chartjs-2';
import { useUser } from '@/hook/useUser';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProgressTracker() {
  const { user } = useUser();
  const isProfessor = user?.role === 'professor';
  const isStudent = user?.role === 'student';

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (isProfessor) {
          const [{ data: studentsData }, { data: coursesData }] = await Promise.all([
            api.get('/auth/role/student'),
            api.get('/courses'),
          ]);
          setStudents(studentsData);
          setCourses(coursesData);
          if (studentsData.length > 0) setSelectedStudentId(studentsData[0].id);
        } else if (isStudent) {
          const { data } = await api.get('/submissions/me');
          setSubmissions(data);
        }
      } catch (err) {
        toast({ title: 'Failed to load data', variant: 'destructive' });
      }
    };

    fetchInitialData();
  }, [isProfessor, isStudent]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedStudentId) return;
      try {
        const { data } = await api.get(`/submissions/student/${selectedStudentId}`);
        setSubmissions(data);
      } catch (err) {
        toast({ title: 'Failed to fetch submissions', variant: 'destructive' });
      }
    };
    if (isProfessor) fetchSubmissions();
  }, [selectedStudentId, isProfessor]);

  const handleGradeChange = (submissionId, value) => {
    setGrades(prev => ({ ...prev, [submissionId]: value }));
  };

  const submitGrade = async (submissionId) => {
    try {
      await api.patch(`/submissions/${submissionId}/grade`, { grade: grades[submissionId] });
      toast({ title: 'Grade updated successfully' });
    } catch (err) {
      toast({ title: 'Failed to update grade', variant: 'destructive' });
    }
  };

  const renderProfessorView = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={String(selectedStudentId)} onValueChange={val => setSelectedStudentId(Number(val))}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a student" />
          </SelectTrigger>
          <SelectContent>
            {students.map(student => (
              <SelectItem key={student.id} value={String(student.id)}>
                {student.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {submissions.map(sub => (
          <Card key={sub.id} className="p-4">
            <div className="font-medium">{sub.type} for Course ID: {sub.course_id}</div>
            <div className="text-sm text-muted-foreground">Submitted: {new Date(sub.created_at).toLocaleDateString()}</div>
            <div className="mt-2">
              <Input 
                type="number" 
                placeholder="Enter grade"
                value={grades[sub.id] || ''} 
                onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                className="w-24"
              />
              <Button size="sm" onClick={() => submitGrade(sub.id)} className="ml-2">
                Save Grade
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStudentView = () => (
    <div className="space-y-3">
      {submissions.map(sub => (
        <Card key={sub.id} className="p-4">
          <div className="font-medium">{sub.type} for Course ID: {sub.course_id}</div>
          <div className="text-sm text-muted-foreground">Submitted: {new Date(sub.created_at).toLocaleDateString()}</div>
          <div className="text-sm">Grade: {sub.grade ?? 'Not Graded'}</div>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        {isProfessor ? renderProfessorView() : renderStudentView()}
      </CardContent>
    </Card>
  );
}
