// ✅ CoursesOverview.jsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CoursesOverview() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data));
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map(course => (
        <Card key={course.id}>
          <CardHeader><CardTitle>{course.title}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Professor ID: {course.professor_id}</p>
            <p className="text-sm">School ID: {course.school_id}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}