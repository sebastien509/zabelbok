import { useEffect, useState } from 'react';
import { Bell, CheckCircle, MailOpen, Mail } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/notification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifications
          </CardTitle>
          {unread.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead} className="text-sm">
              <CheckCircle className="h-4 w-4 mr-2" /> Mark all as read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <MailOpen className="w-10 h-10 mx-auto mb-2" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[70vh]">
              <ul className="divide-y divide-muted-foreground/20">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 hover:bg-muted/10 transition-colors cursor-pointer ${notif.read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}
                    onClick={() => handleMarkRead(notif.id)}
                  >
                    {notif.read ? <Mail className="w-5 h-5 mt-1" /> : <MailOpen className="w-5 h-5 mt-1 text-blue-600" />}
                    <div>
                      <p>{notif.message}</p>
                      <span className="text-xs text-muted-foreground block mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}