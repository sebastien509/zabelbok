import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2, Loader2, File, UploadCloud, BookOpen, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllCourses } from '@/services/courses';
import LectureModal from '@/components/modals/LectureModal';
import { createLecture, getAllLectures, updateLecture, deleteLecture } from '@/services/lectures';

export default function ManageLectures() {
  const [lectures, setLectures] = useState([]);
  const [groupedLectures, setGroupedLectures] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, lecturesRes] = await Promise.all([
          getAllCourses(),
          getAllLectures()
        ]);
        setCourses(coursesRes.data);
        processLectures(lecturesRes.data);
      } catch (error) {
        toast({
          title: 'Error fetching data',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const processLectures = (lecturesData) => {
    const grouped = lecturesData.reduce((acc, lecture) => {
      const key = lecture.course_id || 'Unassigned';
      if (!acc[key]) acc[key] = [];
      acc[key].push(lecture);
      return acc;
    }, {});
    setLectures(lecturesData);
    setGroupedLectures(grouped);
  };

  const handleDelete = async (id) => {
    try {
      await deleteLecture(id);
      toast({
        title: 'Lecture Deleted',
        description: 'Lecture removed successfully'
      });
      const res = await getAllLectures();
      processLectures(res.data);
    } catch (error) {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete lecture',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (lecture) => {
    setEditingId(lecture.id);
    setIsDialogOpen(true);
  };

  const handleLectureSuccess = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    getAllLectures().then(res => processLectures(res.data));
  };

  const filteredLectures = selectedCourse === 'all' 
    ? groupedLectures 
    : { [selectedCourse]: groupedLectures[selectedCourse] || [] };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-9 w-48" />
          <div className="flex gap-3 w-full md:w-auto">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(isMobile ? 2 : 6)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lecture Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Upload and organize your course materials
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full md:w-[220px] bg-white/90 backdrop-blur-sm">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm">
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats and Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white/90 backdrop-blur-sm">
          <span className="font-medium text-blue-600">{lectures.length}</span> {lectures.length === 1 ? 'Lecture' : 'Lectures'} Total
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{courses.length} Courses</span>
        </div>
      </div>

      {/* Lectures Grid */}
      {Object.keys(filteredLectures).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center rounded-lg border border-dashed bg-white/50">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No lectures found</h3>
            <p className="text-muted-foreground">Get started by creating a new lecture</p>
          </div>
          <LectureModal 
            open={isDialogOpen} 
            onClose={() => setIsDialogOpen(false)}
            courseId={selectedCourse === 'all' ? null : selectedCourse}
            onSuccess={handleLectureSuccess}
          >
            <Button className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Lecture
            </Button>
          </LectureModal>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredLectures).map(([courseId, courseLectures]) => (
            <div key={courseId} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {courses.find(c => c.id === courseId)?.title || `Course ID: ${courseId}`}
                  </h2>
                  <Badge variant="secondary" className="px-2.5 py-0.5 bg-white/90 backdrop-blur-sm">
                    {courseLectures.length} {courseLectures.length === 1 ? 'Lecture' : 'Lectures'}
                  </Badge>
                </div>
                
                {/* Course-specific Add Lecture Button */}
             
                  <Button 
                  onClick={() => {
                    setEditingId(null); // or a new lecture
                    setIsDialogOpen(true);
                  }}
                    size="sm" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Lecture to This Course
                  </Button>
                  </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courseLectures.map((lecture) => (
                  <Card 
                    key={lecture.id} 
                    className="hover:shadow-md transition-all duration-200 border hover:border-primary/20 bg-white/90 hover:bg-white"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="truncate">{lecture.title}</span>
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                          {format(new Date(lecture.created_at), 'MMM d')}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">
                          {courses.find(c => c.id === lecture.course_id)?.title || `Course ID: ${lecture.course_id}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={lecture.content_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-primary hover:underline truncate"
                        >
                          View Content
                        </a>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(lecture)}
                        className="flex-1 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(lecture.id)}
                        className="flex-1 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <LectureModal
  open={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  courseId={selectedCourse === 'all' ? null : selectedCourse}
  onSuccess={handleLectureSuccess}
  editingLectureId={editingId}
/>

    </div>
  );
}