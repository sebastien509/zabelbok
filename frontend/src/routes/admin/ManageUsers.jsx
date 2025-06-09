// ✅ ManageUsers.jsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/auth/role/student')
      .then(res => setUsers(res.data))
      .catch(() => toast({ title: 'Failed to load students', variant: 'destructive' }));
  }, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    setUsers(users.filter(u => u.id !== id));
    toast({ title: 'User deleted ✅' });
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader><CardTitle>Manage Students</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {users.map(u => (
              <li key={u.id} className="flex justify-between border p-2 rounded">
                <div>
                  <p className="font-semibold">{u.full_name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <Button variant="destructive" onClick={() => deleteUser(u.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}