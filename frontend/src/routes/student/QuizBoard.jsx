import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, CheckCircle2, Lock } from 'lucide-react';
import SecureContainer from '@/components/assessment/SecureContainer';
import {
  getAllQuizzes,
  getQuiz,
  submitQuiz,
  verifyQuizAttempt,
  getMySubmittedQuizzes
} from '@/services/quizzes';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function QuizBoard() {
  const [quizzes, setQuizzes] = useState([]);
  const [submittedQuizzes, setSubmittedQuizzes] = useState({});
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const refreshData = async () => {
    try {
      const [quizzesResponse, submissionsResponse] = await Promise.all([
        getAllQuizzes(),
        getMySubmittedQuizzes()
      ]);

      setQuizzes(quizzesResponse.data);

      const submittedMap = {};
      submissionsResponse.data.forEach(sub => {
        submittedMap[sub.quiz_id] = sub;
      });

      setSubmittedQuizzes(submittedMap);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load quizzes', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const startQuiz = async (quizId) => {
    try {
      const verification = await verifyQuizAttempt(quizId);
      if (!verification.data.allowed) {
        toast({ title: 'Cannot start quiz', description: verification.data.reason, variant: 'destructive' });
        return;
      }

      setIsLoading(true);
      const response = await getQuiz(quizId);
      const quiz = response.data;

      if (!quiz?.questions?.length) throw new Error('This quiz has no questions');

      setActiveQuiz(quiz);
      setCurrentQuestion(0);
      setAnswers({});
      setQuizStarted(true);

      const deadline = quiz.deadline ? new Date(quiz.deadline) : new Date(Date.now() + 30 * 60000);
      setTimeLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));

    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;

    try {
      setIsSubmitting(true);

      let score = 0;
      activeQuiz.questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) score += 1;
      });
      const finalScore = (score / activeQuiz.questions.length) * 100;

      await submitQuiz(activeQuiz.id, { score: finalScore });
      await refreshData();

      setQuizStarted(false);
      setActiveQuiz(null);

      navigate('/quiz-result', {
        state: {
          score: finalScore,
          totalQuestions: activeQuiz.questions.length,
          quizTitle: activeQuiz.title
        }
      });
    } catch (err) {
      toast({ title: 'Submission Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 || !activeQuiz) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, activeQuiz]);

  const nonSubmittedQuizzes = quizzes.filter(q => !submittedQuizzes[q.id]);
  const submittedQuizzesList = quizzes.filter(q => submittedQuizzes[q.id]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (quizStarted && activeQuiz) {
    const question = activeQuiz.questions[currentQuestion];
    return (
      <SecureContainer onViolation={() => navigate('/quiz-violation')} onExit={() => setQuizStarted(false)}>
        <div className="max-w-3xl mx-auto p-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle>{activeQuiz.title}</CardTitle>
                <div className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {activeQuiz.questions.length} •
                  {timeLeft > 0 && ` ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s`}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-lg font-medium">{question.question_text}</h3>
              <div className="space-y-2">
                {question.choices.map((choice, i) => (
                  <div
                    key={i}
                    className={`p-3 border rounded cursor-pointer ${answers[question.id] === choice ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                    onClick={() => handleAnswerSelect(question.id, choice)}
                  >
                    {choice}
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}>Previous</Button>
                {currentQuestion < activeQuiz.questions.length - 1 ? (
                  <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>Next</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SecureContainer>
    );
  }

  return (
    <div className="space-y-6">
      {nonSubmittedQuizzes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Available Quizzes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nonSubmittedQuizzes.map(quiz => (
                <div key={quiz.id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">{quiz.description}</p>
                    </div>
                    <Button size="sm" onClick={() => startQuiz(quiz.id)}>Start</Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {quiz.questions?.length || 0} questions • {quiz.deadline ? `Deadline: ${new Date(quiz.deadline).toLocaleString()}` : 'No deadline'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {submittedQuizzesList.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Submitted Quizzes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submittedQuizzesList.map(quiz => (
                <div key={quiz.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">{quiz.description}</p>
                    </div>
                    <Badge variant="outline" className="gap-1 text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> Submitted
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {quiz.questions?.length || 0} questions • {quiz.deadline ? `Deadline: ${new Date(quiz.deadline).toLocaleString()}` : 'No deadline'}
                  </div>
                  {!submittedQuizzes[quiz.id]?.published ? (
                    <div className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Grade not available yet
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-green-600">
                      Grade: {submittedQuizzes[quiz.id]?.score ?? 'N/A'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {quizzes.length === 0 && (
        <Card>
          <CardHeader><CardTitle>Available Quizzes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-500">No quizzes available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}