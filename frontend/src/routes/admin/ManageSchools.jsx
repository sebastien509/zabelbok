// ManageSchools.jsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export default function ManageSchools() {
  const [schools, setSchools] = useState([]);
  const [newSchool, setNewSchool] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(true);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
    } catch (err) {
      toast({ title: 'Error loading schools', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createSchool = async () => {
    if (!newSchool.name.trim()) return;
    try {
      const res = await api.post('/schools', newSchool);
      setSchools(prev => [...prev, res.data]);
      setNewSchool({ name: '', location: '' });
      toast({ title: 'School created successfully' });
    } catch (err) {
      toast({ title: 'Failed to create school', variant: 'destructive' });
    }
  };

  const deleteSchool = async (id) => {
    try {
      await api.delete(`/schools/${id}`);
      setSchools(prev => prev.filter(s => s.id !== id));
      toast({ title: 'School deleted' });
    } catch (err) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  useEffect(() => { fetchSchools(); }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Register New School</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="School Name"
            value={newSchool.name}
            onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={newSchool.location}
            onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
          />
          <Button onClick={createSchool}>Add School</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <ul className="space-y-2">
              {schools.map(school => (
                <li key={school.id} className="border p-2 rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-gray-600">{school.location}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteSchool(school.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}