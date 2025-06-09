// ✅ AdminSettings.jsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminSettings() {
  const [adminInfo, setAdminInfo] = useState({ full_name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setAdminInfo({ full_name: res.data.full_name, email: res.data.email });
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4">
      <Card>
        <CardHeader><CardTitle>Admin Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input disabled value={adminInfo.full_name} />
          <Input disabled value={adminInfo.email} />
          <p className="text-sm text-gray-500">To change password or details, contact system developer.</p>
        </CardContent>
      </Card>
    </div>
  );
}