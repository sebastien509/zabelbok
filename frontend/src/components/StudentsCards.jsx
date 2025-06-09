import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function StudentsCards({ enrolledCourses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Enrolled Courses</CardTitle></CardHeader>
        <CardContent>
          <ul>{enrolledCourses.map(c => (<li key={c.id}>• {c.title}</li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
        <CardContent>[Deadlines Placeholder]</CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Progress Tracker</CardTitle></CardHeader>
        <CardContent>[Progress Graph Placeholder]</CardContent>
      </Card>
    </div>
  );
}