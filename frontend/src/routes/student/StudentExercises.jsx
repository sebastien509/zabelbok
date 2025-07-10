import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, CheckCircle2, Lock } from 'lucide-react';
import SecureContainer from '@/components/assessment/SecureContainer';
import { getExercise, submitExercise, getAllExercises } from '@/services/exercices';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'react-router-dom';



export default function StudentExercises() {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState([]);
  const [submittedExercises, setSubmittedExercises] = useState({});
  const [activeExercise, setActiveExercise] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const { id: exerciseIdFromURL } = useParams();



  const fetchData = async () => {
    try {
      const [all, submitted] = await Promise.all([
        getAllExercises(),
        api.get('/results/exercise')
      ]);
      const fetchedExercises = await Promise.all(
        all.data.map(async (exercise) => {
          const detail = await getExercise(exercise.id);
          return detail.data;
        })
      );
      setExercises(fetchedExercises);

      const submittedMap = {};
      submitted.data.forEach(sub => {
        if (!submittedMap[sub.exercise_id]) {
          submittedMap[sub.exercise_id] = {
            published: sub.published_at !== null,
            grade: sub.grade,
            submitted_at: sub.submitted_at
          };
        }
      });
      setSubmittedExercises(submittedMap);
    } catch (err) {
      setToastMsg({ title: t('error'), description: t('loadFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (exerciseIdFromURL) {
      startExercise(exerciseIdFromURL);
    }
  }, [exerciseIdFromURL]);


  useEffect(() => {
    fetchData();
  }, []);

  const startExercise = async (exerciseId) => {
    try {
      const exercise = await getExercise(exerciseId);
      setActiveExercise(exercise.data);
      if (exercise.data.deadline) {
        const deadline = new Date(exercise.data.deadline);
        const now = new Date();
        setTimeLeft(Math.max(0, Math.floor((deadline - now) / 1000)));
      }
    } catch (error) {
      setToastMsg({ title: t('startFailed'), description: error.message });
    }
  };

  const handleViolation = (type) => {
    if (type === 'multiple_tab_switches') {
      setToastMsg({ title: t('assessmentTerminated'), description: t('tabSwitchViolation') });
      navigate('/dashboard/student');
    }
  };

  const handleSubmit = async () => {
    if (!activeExercise) return;
    setIsSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer_text: answer
      }));
      await submitExercise(activeExercise.id, { answers: answersArray });
      setToastMsg({ title: t('submitSuccess') });
      setActiveExercise(null);
      setAnswers({});
      await fetchData();
    } catch (error) {
      setToastMsg({ title: t('submissionFailed'), description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 || !activeExercise) return;
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
  }, [timeLeft, activeExercise]);

  const nonSubmitted = exercises.filter(e => !submittedExercises[e.id]);
  const submittedList = exercises.filter(e => submittedExercises[e.id]);

  const paginatedNonSubmitted = nonSubmitted.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (activeExercise) {
    return (
      <SecureContainer onViolation={handleViolation} onExit={() => setActiveExercise(null)}>
        <div className="max-w-3xl mx-auto p-6">
          <Card className="border shadow-md">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle>{activeExercise.title}</CardTitle>
                {timeLeft > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-1 h-4 w-4" />
                    {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {Array.isArray(activeExercise.questions) && activeExercise.questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <h3 className="font-medium">{t('question')} {index + 1}</h3>
                  <p className="text-gray-700">{question.question_text}</p>
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    placeholder={t('yourAnswer')}
                    className="mt-2 border p-2 rounded w-full"
                  />
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('submitExercise')}
              </Button>
            </div>
          </Card>
        </div>
      </SecureContainer>
    );
  }

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <strong>{toastMsg.title}</strong>
          <p>{toastMsg.description}</p>
        </div>
      )}

      {paginatedNonSubmitted.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle>{t('availableExercises')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
            {paginatedNonSubmitted.map(exercise => {
  const isExpired = exercise.deadline && new Date(exercise.deadline) < new Date();
  return (
    <div key={`exercise-${exercise.id}`} className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{exercise.title}</h3>
          <p className="text-sm text-gray-600">{exercise.description}</p>
        </div>
        {isExpired ? (
          <Button size="sm" variant="destructive" disabled>
            {t('deadlinePassed') || 'Deadline Passed'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => startExercise(exercise.id)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {t('start')}
          </Button>
        )}
      </div>
      {exercise.deadline && (
        <div className="mt-2 text-xs text-gray-500">
          {t('deadline')}: {new Date(exercise.deadline).toLocaleString()}
        </div>
      )}
    </div>
  );
})}

            </div>
            {nonSubmitted.length > pageSize && (
              <div className="flex justify-end mt-4 gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(prev => Math.max(prev - 1, 1))}>{t('prev')}</Button>
                <Button size="sm" variant="outline" onClick={() => setPage(prev => prev + 1)}>{t('next')}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {submittedList.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle>{t('submittedExercises')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submittedList.map(exercise => (
                <div key={`submitted-${exercise.id}`} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{exercise.title}</h3>
                      <p className="text-sm text-gray-600">{exercise.description}</p>
                    </div>
                    <div className="flex gap-2 items-center text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> {t('submitted')}
                    </div>
                  </div>
                  {exercise.deadline && (
                    <div className="mt-2 text-xs text-gray-500">
                      {t('deadline')}: {new Date(exercise.deadline).toLocaleString()}
                    </div>
                  )}
                  {!submittedExercises[exercise.id]?.published ? (
                    <div className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> {t('gradePending')}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-green-600">
                      {t('grade')}: {submittedExercises[exercise.id]?.grade ?? 'N/A'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
