// ✅ LecturesViewOnly.jsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function LecturesViewOnly() {
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    api.get('/lectures').then(res => setLectures(res.data));
  }, []);

  return (
    <div className="p-4 space-y-4">
      {lectures.map(lecture => (
        <Card key={lecture.id}>
          <CardHeader><CardTitle>{lecture.title}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">Course ID: {lecture.course_id}</p>
            <a href={lecture.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Lecture</a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}