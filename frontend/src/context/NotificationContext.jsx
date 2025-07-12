import { createContext, useContext, useEffect, useState } from 'react';
import { getNotifications } from '@/services/notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = async () => {
    try {
      const res = await getNotifications();
  
      // 🛡️ Defensive check
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.notifications)
          ? res.data.notifications
          : [];
  
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to refresh notifications', err);
    }
  };
  
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
