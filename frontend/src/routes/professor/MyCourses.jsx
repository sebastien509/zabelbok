import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '@/services/courses';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Pencil,
  Trash,
  Users,
  Eye,
  School,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', school_id: '' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await getAllCourses();
      setCourses(res.data);
    } catch {
      toast({ title: 'Failed to load courses', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title || !form.school_id) {
      return toast({
        title: 'Title and School ID are required',
        variant: 'destructive',
      });
    }

    try {
      if (editingId) {
        await updateCourse(editingId, form);
        toast({ title: 'Course updated ✅' });
      } else {
        await createCourse(form);
        toast({ title: 'Course created ✅' });
      }
      setForm({ title: '', description: '', school_id: '' });
      setEditingId(null);
      fetchCourses();
    } catch {
      toast({ title: 'Failed to save course', variant: 'destructive' });
    }
  };

  const handleEdit = (course) =>
    setForm({
      title: course.title,
      description: course.description || '',
      school_id: course.school_id || '',
    }) || setEditingId(course.id);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      toast({ title: 'Course deleted 🗑️' });
      fetchCourses();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button variant="ghost" onClick={fetchCourses}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Create/Edit Form */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            {editingId ? 'Edit Course' : 'Create New Course'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            name="title"
            placeholder="Course Title"
            value={form.title}
            onChange={handleChange}
          />
          <Input
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
          />
          <Input
            name="school_id"
            placeholder="School ID"
            value={form.school_id}
            onChange={handleChange}
          />
          <Button className="md:col-span-3" onClick={handleSubmit}>
            {editingId ? 'Update Course' : 'Create Course'}
          </Button>
        </CardContent>
      </Card>

      {/* Course Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    ID: {course.id}
                  </p>
                </div>
                <Badge variant="outline">
                  <School className="mr-1 h-4 w-4" /> {course.school_id}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm">
                {course.description || 'No description provided'}
              </p>

              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <Users className="h-4 w-4" />
                <span>{course.student_count || 0} students enrolled</span>
              </div>

              <p className="text-xs text-gray-500">
                Created by: <strong>{course.professor_name || 'You'}</strong>
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <Eye className="mr-1 h-4 w-4" /> View
                </Button>
                <Button size="sm" onClick={() => handleEdit(course)}>
                  <Pencil className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
