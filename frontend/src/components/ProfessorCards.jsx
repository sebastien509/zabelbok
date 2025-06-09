import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function ProfessorCards({ courses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
        <CardContent>
          <ul>{courses.map(c => (<li key={c.id}>• {c.title}</li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Offline Content Tools</CardTitle></CardHeader>
        <CardContent>[Offline Tools Placeholder]</CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Student Progress</CardTitle></CardHeader>
        <CardContent>[Progress Graph Placeholder]</CardContent>
      </Card>
    </div>
  );
}
