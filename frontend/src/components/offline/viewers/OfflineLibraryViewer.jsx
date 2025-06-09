import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, BookOpen, Video, FileText, Plus, FileInput, List, Grid } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hook/useUser';
import { offlineDB } from '@/utils/offlineDb';


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
  const isProfessor = user?.role === 'professor';

  useEffect(() => {
    const init = async () => {
      await offlineDB.initDB();
  
      // Wait 1 tick to ensure upgrade completes (sometimes required for older browsers)
      setTimeout(async () => {
        if (navigator.onLine) {
          await offlineDB.syncAllUserCoursesToOffline();
        }
        await loadCourses();
      }, 100); // 100ms delay to ensure upgrade is fully settled
    };
  
    init();
  
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);
  
  

  useEffect(() => {
    if (selectedCourse) loadCourseResources();
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (error) {
      toast({
        title: 'Failed to load courses',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const loadCourseResources = async () => {
    setIsLoading(true);
    try {
      const [books, lectures, exercises, quizzes] = await Promise.all([
        offlineDB.getItems('book'),
        offlineDB.getItems('lecture'),
        offlineDB.getItems('exercise'),
        offlineDB.getItems('quiz')
      ]);
      const all = [...books, ...lectures, ...exercises, ...quizzes].filter(r => r.courseId === selectedCourse);
      setResources(all);
    } catch (error) {
      toast({ title: 'Failed to load resources', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => filterType === 'all' || resource.type === filterType);

  const getResourceIcon = (type) => {
    const icons = {
      book: <BookOpen className="h-5 w-5" />,
      lecture: <Video className="h-5 w-5" />,
      exercise: <FileText className="h-5 w-5" />,
      quiz: <FileText className="h-5 w-5" />,
      chapter: <List className="h-5 w-5" />
    };
    return icons[type] || <BookOpen className="h-5 w-5" />;
  };

  const handleResourceAction = (resource) => {
    if (resource.type === 'quiz' || resource.type === 'exercise') {
      navigate(`/attempt/${resource.id}`);
    } else {
      const url = resource.content_url || URL.createObjectURL(resource.blob);
      window.open(url, '_blank');
    }
  };

  const renderResourceDetails = (resource) => {
    if (resource.type === 'book' && resource.chapters) {
      return (
        <ul className="pl-5 text-sm list-disc text-muted-foreground">
          {resource.chapters.map(ch => <li key={ch.id}>{ch.title}</li>)}
        </ul>
      );
    }
    if (resource.type === 'lecture') {
      return <p className="text-xs text-blue-600">URL: {resource.content_url}</p>;
    }
    if ((resource.type === 'exercise' || resource.type === 'quiz') && resource.questions) {
      return (
        <ul className="pl-5 text-sm list-disc text-muted-foreground">
          {resource.questions.map(q => <li key={q.id}>{q.question_text}</li>)}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Course Resources</h1>
        <p className="mb-6">{isOnline ? "Access all your course materials online and offline" : "You're offline - only downloaded resources are available"}</p>
        <div className="flex items-center gap-4">
        <Select value={selectedCourse?.toString()} onValueChange={(val) => setSelectedCourse(Number(val))}>
        <SelectTrigger className="w-[300px] bg-white/10 border-white/30">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent className="bg-white/70">
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isOnline && (
            <Button variant="secondary" onClick={loadCourseResources}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {selectedCourse && (
        <Tabs defaultValue="resources" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="resources">Course Materials</TabsTrigger>
              {isProfessor && <TabsTrigger value="manage">Manage Content</TabsTrigger>}
            </TabsList>
            <div className="flex gap-2">
              <Button size="sm" variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></Button>
              <Button size="sm" variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            </div>
          </div>

          <TabsContent value="resources">
            <div className="flex justify-between items-center mb-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                <SelectContent className="bg-white/70">
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="book">Books</SelectItem>
                  <SelectItem value="lecture">Lectures</SelectItem>
                  <SelectItem value="exercise">Exercises</SelectItem>
                  {isProfessor && <SelectItem value="quiz">Quizzes</SelectItem>}
                </SelectContent>
              </Select>
              {!isOnline && <Badge variant="secondary" className="px-3 py-1">Offline Mode</Badge>}
            </div>

            {filteredResources.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-gray-500">No resources found</CardContent></Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map(resource => (
                  <Card key={resource.id}>
                    <CardHeader className="flex gap-3">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">{getResourceIcon(resource.type)}</div>
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge className="capitalize mt-1">{resource.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                      {renderResourceDetails(resource)}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button size="sm" onClick={() => handleResourceAction(resource)}>
                        {['quiz', 'exercise'].includes(resource.type) ? 'Attempt' : 'Open'}
                      </Button>
                      <span className="text-xs text-gray-500">{new Date(resource.downloadedAt).toLocaleDateString()}</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredResources.map(resource => (
                  <Card key={resource.id}>
                    <CardContent className="flex items-center p-4 gap-4">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">{getResourceIcon(resource.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                        {renderResourceDetails(resource)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{resource.type}</Badge>
                        <Button size="sm" onClick={() => handleResourceAction(resource)}>
                          {['quiz', 'exercise'].includes(resource.type) ? 'Attempt' : 'Open'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Professor Management Tab */}
          {isProfessor && (
            <TabsContent value="manage">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer h-full"
                  onClick={() => handleCreateNew('book')}
                >
                  <CardHeader className="items-center text-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-2">
                      <Plus className="h-6 w-6" />
                    </div>
                    <CardTitle>Add New Book</CardTitle>
                  </CardHeader>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer h-full"
                  onClick={() => handleCreateNew('chapter')}
                >
                  <CardHeader className="items-center text-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mb-2">
                      <Plus className="h-6 w-6" />
                    </div>
                    <CardTitle>Add Book Chapter</CardTitle>
                  </CardHeader>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer h-full"
                  onClick={() => handleCreateNew('lecture')}
                >
                  <CardHeader className="items-center text-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-2">
                      <Plus className="h-6 w-6" />
                    </div>
                    <CardTitle>Upload Lecture</CardTitle>
                  </CardHeader>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer h-full"
                  onClick={() => handleCreateNew('quiz')}
                >
                  <CardHeader className="items-center text-center">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600 mb-2">
                      <Plus className="h-6 w-6" />
                    </div>
                    <CardTitle>Create Quiz</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">Upload Resources</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Upload</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <FileInput className="h-9 px-4 py-2" />
                      <Button>Upload Files</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
