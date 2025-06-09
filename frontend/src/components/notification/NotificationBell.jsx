import { useEffect, useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/notification';
import { toast } from '@/components/ui/use-toast';
import { Button } from '../ui/button';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(new Set());
  const [open, setOpen] = useState(false);

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

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  };

  return (
    <div className="relative inline-block text-left">
      <Button variant="ghost" onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {unread.length}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 font-semibold border-b">Notifications</div>
          <ul className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">No notifications</li>
            ) : (
              notifications.map(notif => (
                <li
                  key={notif.id}
                  className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 ${
                    notif.read ? 'text-gray-500' : 'font-medium'
                  }`}
                  onClick={() => handleMarkRead(notif.id)}
                >
                  {notif.message}
                </li>
              ))
            )}
          </ul>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="w-full px-4 py-2 text-sm text-blue-600 flex items-center justify-center hover:bg-blue-50 border-t"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
}
