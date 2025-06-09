import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookOpen, Video, FileText, Clock, Users, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function StudentCourseDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [course, setCourse] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [exerciseSubmissions, setExerciseSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get(`/courses/${id}?include_nested=true`);
        const quizRes = await api.get('/results/quiz');
        const exerciseRes = await api.get('/results/exercise');

        setCourse(courseRes.data);
        setQuizResults(quizRes.data);
        setExerciseSubmissions(exerciseRes.data);
      } catch (err) {
        toast({
          title: t('loadError'),
          description: err.message,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, t]);

  const getQuizGrade = quizId => quizResults.find(q => q.quiz_id === quizId);
  const getExerciseSubmission = id => exerciseSubmissions.find(e => e.exercise_id === id);

  const renderSectionTitle = (icon, label) => (
    <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-green-800">
      {icon}
      {label}
    </div>
  );

  const renderTabContent = () => {
    if (!course) return null;
    switch (activeTab) {
      case 'materials':
        return (
          <div className="space-y-4">
            {renderSectionTitle(<BookOpen size={18} />, t('booksAndMaterials'))}
            {course.books?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.books.map(book => (
                  <div key={book.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md bg-white">
                    <h3 className="font-bold text-md text-green-900 truncate">{book.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{book.description}</p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link to={`/books/read/${book.id}`}>{t('readBook')}</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('noBooksAvailable')}</p>
            )}
          </div>
        );
      case 'lectures':
        return (
          <div className="space-y-4">
            {renderSectionTitle(<Video size={18} />, t('lectures'))}
            {course.lectures?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.lectures.map(lecture => (
                  <div key={lecture.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md bg-white">
                    <h3 className="font-bold text-md text-green-900 truncate">{lecture.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{lecture.description}</p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link to={`/lectures/watch/${lecture.id}`}>{t('watchLecture')}</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('noLecturesAvailable')}</p>
            )}
          </div>
        );
      case 'assignments':
        return (
          <div className="space-y-6">
            {renderSectionTitle(<FileText size={18} />, t('assignments'))}
            <div className="space-y-4">
              {course.quizzes?.map(quiz => {
                const grade = getQuizGrade(quiz.id);
                return (
                  <div key={quiz.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-md text-green-900">{quiz.title}</h3>
                      {grade && <span className="text-sm text-yellow-600">{t('grade')}: {grade.score}</span>}
                    </div>
                    <p className="text-sm text-gray-600">{quiz.description}</p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link to={`/student/Quiz/${quiz.id}`}>{grade ? t('viewQuiz') : t('takeQuiz')}</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="space-y-4">
              {course.exercises?.map(ex => {
                const submission = getExerciseSubmission(ex.id);
                return (
                  <div key={ex.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-md text-green-900">{ex.title}</h3>
                      {submission && <span className="text-sm text-green-600">{t('grade')}: {submission.grade}</span>}
                    </div>
                    <p className="text-sm text-gray-600">{ex.description}</p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link to={`/exercises/solve/${ex.id}`}>{submission ? t('viewSubmission') : t('startExercise')}</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {renderSectionTitle(<Bookmark size={18} />, t('courseOverview'))}
            <p className="text-sm text-gray-700">{course.description}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">{t('loadingCourse')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="border-b p-4 bg-green-50 rounded-t-xl">
        <h1 className="text-xl font-semibold text-green-900">{course?.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span><Users size={14} className="inline-block mr-1" /> {t('professor')}: {course.professor_name || t('notAssigned')}</span>
          <span><Clock size={14} className="inline-block mr-1" /> {t('startedOn')}: {new Date(course.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'default' : 'outline'}>{t('overview')}</Button>
          <Button onClick={() => setActiveTab('materials')} variant={activeTab === 'materials' ? 'default' : 'outline'}>{t('materials')}</Button>
          <Button onClick={() => setActiveTab('lectures')} variant={activeTab === 'lectures' ? 'default' : 'outline'}>{t('lectures')}</Button>
          <Button onClick={() => setActiveTab('assignments')} variant={activeTab === 'assignments' ? 'default' : 'outline'}>{t('assignments')}</Button>
        </div>
        <ScrollArea className="h-[calc(100vh-300px)] pr-2">
          {renderTabContent()}
        </ScrollArea>
      </div>
    </div>
  );
}
