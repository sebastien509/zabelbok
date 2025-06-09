import { useState, useEffect } from 'react';
import { 
  getAllExercises, 
  deleteExercise, 
  getExerciseSubmissionsByExercise 
} from '@/services/exercices';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash2, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { FiCalendar, FiUsers, FiBookOpen } from 'react-icons/fi';
import ExerciseModal from '@/components/modals/ExerciseModal';

export default function ProfessorExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [modalExercise, setModalExercise] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await getAllExercises();
      setExercises(res.data);
    } catch (error) {
      setToastMsg({ title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (exerciseId) => {
    try {
      const res = await getExerciseSubmissionsByExercise(exerciseId);
      setSubmissions(res.data);
      setSelectedExercise(exerciseId);
    } catch (error) {
      setToastMsg({ title: 'Error', description: error.message });
    }
  };

  const handleDelete = async (exerciseId) => {
    try {
      await deleteExercise(exerciseId);
      fetchExercises();
    } catch (err) {
      setToastMsg({ title: 'Error deleting exercise', description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <strong>{toastMsg.title}</strong>
          <p>{toastMsg.description}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Exercises</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Exercise</DialogTitle>
            </DialogHeader>
            <ExerciseModal onClose={() => setIsDialogOpen(false)} onSave={fetchExercises} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="shadow-sm hover:shadow-md transition text-sm">
            <CardHeader className="bg-green-50 border-b px-4 py-2">
              <CardTitle className="flex justify-between items-center text-base">
                <span className="truncate max-w-[80%]">{exercise.title}</span>
                <FileText className="h-5 w-5 text-green-600 shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-gray-700 px-4 py-2">
              <p className="truncate"><FiBookOpen className="inline mr-1" /> {exercise.description}</p>
              <p><strong>Course:</strong> {exercise.course_id}</p>
              {exercise.deadline && (
                <p><FiCalendar className="inline mr-1" /> {format(new Date(exercise.deadline), 'MMM d, yyyy')}</p>
              )}
              <p><FiUsers className="inline mr-1" /> {exercise.questions?.length || 0} Questions</p>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between gap-2 px-4 py-2 border-t">
              <Button size="sm" className="flex-1 min-w-[40%]" onClick={() => setModalExercise(exercise)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button size="sm" className="flex-1 min-w-[40%]" variant="destructive" onClick={() => handleDelete(exercise.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
              <Button size="sm" className="w-full" variant="outline" onClick={() => fetchSubmissions(exercise.id)}>
                View Submissions
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {modalExercise && (
        <Dialog open={!!modalExercise} onOpenChange={() => setModalExercise(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Exercise</DialogTitle>
            </DialogHeader>
            <ExerciseModal exercise={modalExercise} onClose={() => setModalExercise(null)} onSave={fetchExercises} />
          </DialogContent>
        </Dialog>
      )}

      {selectedExercise && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Submissions for Exercise #{selectedExercise}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.submission_id}>
                  <TableCell>{sub.student_id}</TableCell>
                  <TableCell>{sub.question_id}</TableCell>
                  <TableCell className="max-w-xs truncate">{sub.answer_text}</TableCell>
                  <TableCell>{sub.grade !== null ? sub.grade : 'Not graded'}</TableCell>
                  <TableCell>{sub.published ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
