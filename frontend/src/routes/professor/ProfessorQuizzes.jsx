import { useState, useEffect } from 'react';
import { 
  getAllQuizzes, 
  deleteQuiz, 
  getQuizSubmissionsByQuiz
} from '@/services/quizzes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { PlusCircle, Pencil, Trash2, FileText } from 'lucide-react';
import { Skeleton } from '@/components2/ui/skeleton';
import { format } from 'date-fns';
import { FiCalendar, FiUsers, FiBookOpen } from 'react-icons/fi';
import FullQuizBuilder from '@/components/quizzes/FullQuizBuilder';

export default function ProfessorQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await getAllQuizzes();
      setQuizzes(res.data);
    } catch (error) {
      setToastMsg({ title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (quizId) => {
    try {
      const res = await getQuizSubmissionsByQuiz(quizId);
      setSubmissions(res.data);
      setSelectedQuiz(quizId);
    } catch (error) {
      setToastMsg({ title: 'Error', description: error.message });
    }
  };

  const handleDelete = async (quizId) => {
    try {
      await deleteQuiz(quizId);
      fetchQuizzes();
    } catch (err) {
      setToastMsg({ title: 'Error deleting quiz', description: err.message });
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
        <h1 className="text-2xl font-bold">All Quizzes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <FullQuizBuilder />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="shadow-sm hover:shadow-md transition text-sm">
            <CardHeader className="bg-blue-50 border-b px-4 py-2">
              <CardTitle className="flex justify-between items-center text-base">
                <span className="truncate max-w-[80%]">{quiz.title}</span>
                <FileText className="h-5 w-5 text-blue-600 shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-gray-700 px-4 py-2">
              <p className="truncate"><FiBookOpen className="inline mr-1" /> {quiz.description}</p>
              <p><strong>Course:</strong> {quiz.course_id}</p>
              {quiz.deadline && (
                <p><FiCalendar className="inline mr-1" /> {format(new Date(quiz.deadline), 'MMM d, yyyy HH:mm')}</p>
              )}
              <p><FiUsers className="inline mr-1" /> {quiz.questions?.length || 0} Questions</p>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between gap-2 px-4 py-2 border-t">
              <Button size="sm" className="flex-1 min-w-[40%]" onClick={() => setSelectedQuiz(quiz)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button size="sm" className="flex-1 min-w-[40%]" variant="destructive" onClick={() => handleDelete(quiz.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
              <Button size="sm" className="w-full" variant="outline" onClick={() => fetchSubmissions(quiz.id)}>
                View Submissions
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedQuiz && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Submissions for Quiz #{selectedQuiz.id}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.submission_id}>
                  <TableCell>{sub.student_id}</TableCell>
                  <TableCell>{sub.score !== null ? `${sub.score}%` : 'Ungraded'}</TableCell>
                  <TableCell>{format(new Date(sub.submitted_at), 'MMM d, yyyy HH:mm')}</TableCell>
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
