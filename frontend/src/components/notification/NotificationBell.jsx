import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { getNotifications } from '@/services/notification';
import { toast } from '@/components/ui/use-toast';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(new Set());
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      const fresh = res.data.filter(n => !seenIds.has(n.id) && !n.read);

      fresh.forEach(n => {
        toast({
          title: '🔔 New Notification',
          description: n.message,
        });
      });

      setSeenIds(new Set(res.data.map(n => n.id)));
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const unread = notifications.filter(n => !n.read);

  return (
    <div className="relative inline-block text-left">
      <Button variant="ghost" onClick={() => navigate('/notifications')} className="relative">
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {unread.length}
          </span>
        )} 
      Notifications 
      </Button>
    </div>
  );
}
