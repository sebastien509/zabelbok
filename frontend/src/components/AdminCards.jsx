import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Schools Management</CardTitle></CardHeader>
        <CardContent>[Schools Table Placeholder]</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Users Management</CardTitle></CardHeader>
        <CardContent>[Users Table Placeholder]</CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Analytics Overview</CardTitle></CardHeader>
        <CardContent>[Analytics Graph Placeholder]</CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><CardTitle>System Logs</CardTitle></CardHeader>
        <CardContent>[Logs Placeholder]</CardContent>
      </Card>
    </div>
  );
}
