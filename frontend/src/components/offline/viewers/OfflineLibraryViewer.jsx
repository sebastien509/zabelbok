import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  RefreshCw, 
  BookOpen, 
  Video, 
  FileText, 
  Plus, 
  List, 
  Grid,
  Download,
  Bookmark,
  FileVideo,
  FileQuestion,
  Lock as LockIcon // 👈 renamed Lock to avoid "Illegal constructor" error
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';


import { toast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hook/useUser';
import { offlineDB } from '@/utils/offlineDB'
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';



export default function OfflineLibraryViewer() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();
  const [iframeUrl, setIframeUrl] = useState(null);
  const { t } = useTranslation();


  
  const isProfessor = user?.role === 'professor';
  const isStudent = user?.role === 'student';


  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await offlineDB.syncAllUserCourses(); // This stores offline data
        const offlineCourses = offlineDB.getAllCourses(); // Uses the JSON cache
        setCourses(offlineCourses);
        if (offlineCourses.length > 0) {
          setSelectedCourse(offlineCourses[0].id);
        }
      } catch (err) {
        toast({
          title: 'Sync Failed',
          description: err.message,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    init();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const items = offlineDB.getResources(selectedCourse, filterType); // refactored
      setResources(items);
    }
  }, [selectedCourse, filterType]);

  // const loadCourses = async () => {
  //   try {
  //     const response = api.get('/courses');
  //     setCourses(response.data);
  //     if (response.data.length > 0) {
  //       setSelectedCourse(response.data[0].id);
  //     }
  //   } catch (error) {
  //     toast({
  //       title: 'Failed to load courses',
  //       description: error.message,
  //       variant: 'destructive'
  //     });
  //   }
  // };

  // const loadCourseResources = async () => {
  //   setIsLoading(true);
  //   try {
  //     console.group('[LOAD] Loading resources');
      
  //     // Get all resources for this course in one query
  //     const allResources = await offlineDB.getItems(null, selectedCourse);
  //     console.log('All resources for course:', allResources);
  
  //     // If empty, try the old method as fallback
  //     if (allResources.length === 0) {
  //       console.warn('No resources found with direct course query, trying type-based fallback');
  //       const [books, lectures, exercises, quizzes] = await Promise.all([
  //         offlineDB.getItems('book'),
  //         offlineDB.getItems('lecture'),
  //         offlineDB.getItems('exercise'),
  //         offlineDB.getItems('quiz')
  //       ]);
        
  //       allResources = [...books, ...lectures, ...exercises, ...quizzes]
  //         .filter(r => String(r.courseId || r.course_id) === String(selectedCourse));
  //     }
  
  //     console.log('Final filtered resources:', allResources);
  //     setResources(allResources);
      
  //     console.groupEnd();
  //   } catch (error) {
  //     console.error('[LOAD] Error:', error);
  //     toast({
  //       title: 'Loading failed',
  //       description: error.message,
  //       variant: 'destructive'
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
  const handleCreateNew = (type) => {
    switch (type) {
      case 'book':
        navigate('/books/manage');
        break;
      case 'lecture':
        navigate('/lectures/manage');
        break;
      case 'quiz':
        navigate('/quizzes/manage');
        break;
      case 'exercise':
        navigate('/exercises');
        break;
      default:
        toast({
          title: 'Invalid Resource Type',
          description: `No page connected for type: ${type}`,
          variant: 'destructive',
        });
    }
  };

  const handleAccess = (url) => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx')) {
      setIframeUrl(url);
    } else {
      window.open(url, '_blank');
    }
  };
  
  

// Example improvement in OfflineViewer
const handleResourceAction = (resource) => {
  try {
    console.log('[DEBUG] Opening resource:', resource);

    let url = null;

    if (resource.content_url) {
      url = resource.content_url;
    } else if (resource.blob) {
      url = URL.createObjectURL(resource.blob);
    } else {
      throw new Error('No available content for this resource');
    }

    if (isStudent) {
      if (resource.type === 'quiz') {
        navigate(`/quiz/${resource.id}`);
        return;
      }

      if (resource.type === 'exercise') {
        navigate(`/exercise/${resource.id}`);
        return;
      }

      // ✅ Explicitly handle books and lectures
      if (resource.type === 'book' || resource.type === 'lecture') {
        handleAccess(url);
        return;
      }

      // Fallback
      handleAccess(url);
      return;
    }

    if (isProfessor) {
      if (resource.type === 'quiz') {
        navigate(`/quizzes/manage`);
        return;
      }

      if (resource.type === 'exercise') {
        navigate(`/exercises`);
        return;
      }

      // ✅ Explicitly handle books and lectures
      if (resource.type === 'book' || resource.type === 'lecture') {
        handleAccess(url);
        return;
      }

      // Fallback
      handleAccess(url);
      return;
    }

    // Generic fallback for other roles or undefined
    handleAccess(url, resource.type)
  } catch (error) {
    toast({
      title: 'Failed to open resource',
      description: error.message,
      variant: 'destructive'
    });
  }
};



  const filteredResources = resources.filter(resource => 
    filterType === 'all' || resource.type === filterType
  );

  const getResourceIcon = (type) => {
    const icons = {
      book: <BookOpen className="h-5 w-5" />,
      lecture: <FileText className="h-5 w-5" />,
      exercise: <FileText className="h-5 w-5" />,
      quiz: <FileQuestion className="h-5 w-5" />,
      // chapter: <Bookmark className="h-5 w-5" />
    };
    return icons[type] || <BookOpen className="h-5 w-5" />;
  };

  const getActionButton = (resource) => {
  
    if (isStudent) {
      const deadlinePassed = resource.deadline && new Date(resource.deadline) < new Date();

      if (deadlinePassed && (resource.type === 'quiz' || resource.type === 'exercise')) {
        return { 
          label: 'Deadline Passed', 
          icon: <LockIcon className="h-4 w-4 text-red-500" />,
          disabled: true,
          variant: 'destructive'
        };
      }
      
      if (resource.type === 'quiz') {
        return { label: 'Start Quiz', icon: <FileQuestion className="h-4 w-4" /> };
      } else if (resource.type === 'exercise') {
        return { label: 'Start Exercise', icon: <FileText className="h-4 w-4" /> };
      }
      return { label: 'Open', icon: <BookOpen className="h-4 w-4" /> };
    }
  
    if (isProfessor) {
      if (resource.type === 'quiz' || resource.type === 'exercise') {
        return { label: 'View Submissions', icon: <List className="h-4 w-4" /> };
      }
      return { label: 'Open', icon: <BookOpen className="h-4 w-4" /> };
    }
  
    return { label: 'Open', icon: <BookOpen className="h-4 w-4" /> };
  };
  

  const renderResourceDetails = (resource) => {
    if (resource.type === 'book' && resource.chapters) {
      return (
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground">{t('chapters')}</p>
          <ul className="pl-4 text-xs list-disc text-muted-foreground">
            {resource.chapters.map(ch => (
              <li key={ch.id}>{ch.title}</li>
            ))}
            
          </ul>
        </div>
      );
    }
    if (resource.type === 'lecture') {
      return (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <p className="font-medium">Lecture Info</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Format: {resource.file_type?.toUpperCase() || 'Unknown'}</li>
            <li>Course: {resource.course?.title || 'Not Linked'}</li>
          </ul>
        </div>
      );
    }
    
    if ((resource.type === 'exercise' || resource.type === 'quiz') && resource.questions) {
      return (
        <p className="text-xs text-muted-foreground">
          {resource.questions.length} questions
        </p>
      );
    }
    return null;
  };

  const resourceTypes = [
    { value: 'all', label: 'All Resources', icon: <List className="h-4 w-4" /> },
    { value: 'book', label: 'Books', icon: <BookOpen className="h-4 w-4" /> },
    { value: 'lecture', label: 'Lectures', icon: <FileText className="h-4 w-4" /> },
    { value: 'exercise', label: 'Exercises', icon: <FileText className="h-4 w-4" /> },
    { value: 'quiz', label: 'Quizzes', icon: <FileQuestion className="h-4 w-4" /> }
  ];

  if (isLoading && !selectedCourse) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  const handleRefresh = () => {
    const updated = offlineDB.getResources(selectedCourse, filterType);
    setResources(updated);
  };


  return (
      <div className="space-y-6 p-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {isProfessor ? t('courseResourcesManager') : t('myLearningResources')}
              </h1>
              <p className="text-blue-100">
                {isOnline ? t('accessOnline') : t('accessOffline')}
              </p>
            </div>
    
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={selectedCourse?.toString()} 
                onValueChange={(val) => setSelectedCourse(Number(val))}
              >
                <SelectTrigger className="bg-white/10 border-white/30 text-white">
                  <SelectValue placeholder={t('selectCourse')}>
                    {courses.find(c => c.id === selectedCourse)?.title || t('selectCourse')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
    
              {isOnline && (
                <Button variant="secondary" onClick={handleRefresh} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t('refresh')}
                </Button>
              )}
            </div>
          </div>
        </div>
    
        {selectedCourse && (
          <Tabs defaultValue="resources" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="resources">
                  {isProfessor ? t('courseMaterials') : t('myMaterials')}
                </TabsTrigger>
                {isProfessor && (
                  <TabsTrigger value="manage">{t('manageContent')}</TabsTrigger>
                )}
              </TabsList>
    
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="min-w-[180px]">
                    <div className="flex items-center gap-2">
                      {resourceTypes.find(t => t.value === filterType)?.icon}
                      <SelectValue placeholder={t('filterResources')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {t(type.label)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
    
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
    
            <TabsContent value="resources">
              {filteredResources.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-gray-400 mb-2">
                      <BookOpen className="h-8 w-8 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500">
                      {t('noResourcesFound')}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {isProfessor ? t('professorEmptyState') : t('studentEmptyState')}
                    </p>
                  </CardContent>
                </Card>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map(resource => {
                    const action = getActionButton(resource);
                    return (
                      <Card key={resource.id} className="hover:shadow-md transition-all h-full flex flex-col">
                        <CardHeader className="flex flex-row items-start gap-3 pb-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">
                              {resource.title}
                            </CardTitle>
                            <Badge variant="outline" className="capitalize mt-1">
                              {resource.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                            {resource.description}
                          </p>
                          {renderResourceDetails(resource)}
                        </CardContent>
                        <CardFooter className="flex justify-between items-center pt-3">
                          <Button
                            size="sm"
                            variant={action.variant || 'outline'}
                            onClick={() => handleResourceAction(resource)}
                            disabled={action.disabled}
                            className="shrink-0 gap-2"
                          >
                            {action.icon}
                            {t(action.label)}
                          </Button>
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(resource.updatedAt || resource.downloadedAt).toLocaleDateString()}
                          </span>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredResources.map(resource => {
                    const action = getActionButton(resource);
                    return (
                      <Card key={resource.id} className="hover:bg-gray-50/50 transition-colors">
                        <CardContent className="flex items-center p-4 gap-4">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{resource.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="capitalize text-xs">
                                {resource.type}
                              </Badge>
                              <p className="text-xs text-muted-foreground truncate">
                                {resource.description}
                              </p>
                            </div>
                            {renderResourceDetails(resource)}
                          </div>
                          <Button
                            size="sm"
                            variant={action.variant || 'outline'}
                            onClick={() => handleResourceAction(resource)}
                            disabled={action.disabled}
                            className="shrink-0 gap-2"
                          >
                            {action.icon}
                            {t(action.label)}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
    
            {/* Professor Management Tab */}
            {isProfessor && (
              <TabsContent value="manage" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover:shadow-md transition-all cursor-pointer h-full border-blue-100" onClick={() => handleCreateNew('book')}>
                    <CardHeader className="items-center text-center p-6">
                      <div className="p-3 rounded-full bg-blue-50 text-blue-600 mb-3">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{t('addBook')}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{t('uploadTextbook')}</p>
                    </CardHeader>
                  </Card>
    
                  <Card className="hover:shadow-md transition-all cursor-pointer h-full border-purple-100" onClick={() => handleCreateNew('lecture')}>
                    <CardHeader className="items-center text-center p-6">
                      <div className="p-3 rounded-full bg-purple-50 text-purple-600 mb-3">
                        <FileVideo className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{t('addLecture')}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{t('uploadLecture')}</p>
                    </CardHeader>
                  </Card>
    
                  <Card className="hover:shadow-md transition-all cursor-pointer h-full border-green-100" onClick={() => handleCreateNew('exercise')}>
                    <CardHeader className="items-center text-center p-6">
                      <div className="p-3 rounded-full bg-green-50 text-green-600 mb-3">
                        <FileText className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{t('addExercise')}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{t('createPractice')}</p>
                    </CardHeader>
                  </Card>
    
                  <Card className="hover:shadow-md transition-all cursor-pointer h-full border-orange-100" onClick={() => handleCreateNew('quiz')}>
                    <CardHeader className="items-center text-center p-6">
                      <div className="p-3 rounded-full bg-orange-50 text-orange-600 mb-3">
                        <FileQuestion className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{t('createQuiz')}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{t('buildAssessments')}</p>
                    </CardHeader>
                  </Card>
                </div>
    
                <Separator className="my-4" />
    
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h3 className="font-medium mb-3">{t('quickActions')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      {t('downloadAll')}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      {t('syncOffline')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
    
        {/* Modal with iframe */}
        <Dialog open={!!iframeUrl} onOpenChange={() => setIframeUrl(null)}>
          <DialogContent className="p-0 overflow-hidden w-full max-w-5xl h-[90vh] max-h-[90vh]">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => setIframeUrl(null)}
                className="text-gray-500 hover:text-red-500 bg-white/80 backdrop-blur-sm rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {iframeUrl && (
              <iframe
                src={iframeUrl}
                title="Lecture Preview"
                className="w-full h-full border-none"
                allow="fullscreen"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }