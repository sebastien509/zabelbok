import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2, Loader2, File, UploadCloud, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { createLecture, getAllLectures, updateLecture, deleteLecture } from '@/services/lectures';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllCourses } from '@/services/courses';

export default function ManageLectures() {
  const [lectures, setLectures] = useState([]);
  const [groupedLectures, setGroupedLectures] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', content_url: '', course_id: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile view
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const res = await getAllCourses();
          setCourses(res.data);
          fetchLectures(); // already async, so you can call it as is
        } catch (error) {
          toast({
            title: 'Error fetching courses',
            description: error.message,
            variant: 'destructive',
          });
        }
      };
    
      fetchData();
  }, []);

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const res = await getAllLectures();
      const grouped = res.data.reduce((acc, lecture) => {
        const key = lecture.course_id || 'Unassigned';
        if (!acc[key]) acc[key] = [];
        acc[key].push(lecture);
        return acc;
      }, {});
      setLectures(res.data);
      setGroupedLectures(grouped);
    } catch (error) {
      toast({
        title: 'Error fetching lectures',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Upload Failed',
        description: 'No file selected',
        variant: 'destructive'
      });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, content_url: url }));
      toast({
        title: 'Upload Successful',
        description: 'File uploaded to Cloudinary'
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLecture(id);
      toast({
        title: 'Lecture Deleted',
        description: 'Lecture removed successfully'
      });
      fetchLectures();
    } catch (error) {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete lecture',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content_url || !form.course_id) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill all fields and upload a file',
        variant: 'destructive'
      });
      return;
    }
    try {
      if (editingId) {
        await updateLecture(editingId, form);
        toast({ 
          title: 'Lecture updated successfully',
          description: 'Your changes have been saved'
        });
      } else {
        await createLecture(form);
        toast({ 
          title: 'Lecture created successfully',
          description: 'New lecture has been added'
        });
      }
      resetForm();
      fetchLectures();
    } catch (error) {
      toast({
        title: 'Error saving lecture',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (lecture) => {
    setEditingId(lecture.id);
    setForm({
      title: lecture.title,
      content_url: lecture.content_url,
      course_id: lecture.course_id
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setForm({ title: '', content_url: '', course_id: '' });
    setFile(null);
    setEditingId(null);
    setIsDialogOpen(false);
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
      {/* Enhanced Header Section */}
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Lecture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingId ? 'Edit Lecture' : 'Create New Lecture'}
                </DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update your lecture details' : 'Add a new lecture to your course'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lecture Title</Label>
                  <Input 
                    id="title" 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    placeholder="e.g. Introduction to React" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_id">Course</Label>
                  <Select 
                    value={form.course_id} 
                    onValueChange={(value) => setForm({ ...form, course_id: value })}
                  >
                    <SelectTrigger className="bg-white/90">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lecture Content</Label>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Input 
                      type="file" 
                      onChange={(e) => setFile(e.target.files?.[0])} 
                      accept="audio/*,video/*,application/pdf,image/*" 
                      className="flex-1" 
                    />
                    <Button 
                      type="button" 
                      onClick={handleUpload} 
                      disabled={uploading || !file}
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UploadCloud className="mr-2 h-4 w-4" />
                      )}
                      Upload
                    </Button>
                  </div>
                  {form.content_url && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                      <File className="h-4 w-4" />
                      <span className="truncate">File uploaded successfully</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!form.content_url}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {editingId ? 'Save Changes' : 'Create Lecture'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
          <DialogTrigger asChild>
            <Button className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Lecture
            </Button>
          </DialogTrigger>
        </div>
      ) : (
        Object.entries(filteredLectures).map(([courseId, courseLectures]) => (
          <div key={courseId} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {courses.find(c => c.id === courseId)?.name || `Course ID: ${courseId}`}
              </h2>
              <Badge variant="secondary" className="px-2.5 py-0.5 bg-white/90 backdrop-blur-sm">
                {courseLectures.length} {courseLectures.length === 1 ? 'Lecture' : 'Lectures'}
              </Badge>
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
                        {courses.find(c => c.id === lecture.course_id)?.name || `Course ID: ${lecture.course_id}`}
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
        ))
      )}
    </div>
  );
}