// ✅ src/components/system/RoleBasedOfflinePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

import StudentOffline from '../offline/StudentOffline';
import ProfessorOfflineContent from '@/routes/professor/ProfessorOfflineContent';

export default function RoleBasedOfflinePage() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('role');
    if (!stored) {
      toast({
        title: 'Unauthorized',
        description: 'No role found. Please log in.',
        variant: 'destructive',
      });
      navigate('/login');
    } else {
      setRole(stored);
    }
  }, [navigate]);

  if (!role) return null;

  return role === 'student' ? <StudentOffline /> : <ProfessorOfflineContent />;
}
