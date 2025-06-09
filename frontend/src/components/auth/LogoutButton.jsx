// src/components/auth/LogoutButton.jsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Button onClick={handleLogout} variant="outline" className="mt-4">
      Logout
    </Button>
  );
}
