import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FaWifi, FaCloudDownloadAlt, FaEnvelope, FaTasks } from 'react-icons/fa';
import { MdWifiOff } from 'react-icons/md'; // Material Icons
import { useState , useEffect} from 'react';


export default function OfflineStatusPanel() {
  const [status, setStatus] = useState({
    online: navigator.onLine,
    messageQueue: 0,
    exerciseQueue: 0,
    downloadProgress: 0
  });

  useEffect(() => {
    const updateStatus = () => {
      const messages = JSON.parse(localStorage.getItem('messageQueue') || '[]');
      const exercises = JSON.parse(localStorage.getItem('exerciseQueue') || '[]');
      const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
      
      
      setStatus({
        online: navigator.onLine,
        messageQueue: messages.filter(m => !m.synced).length,
        exerciseQueue: exercises.filter(e => !e.synced).length,
        downloadProgress: downloads.length > 0 ? 
          downloads.reduce((sum, d) => sum + (d.progress || 0), 0) / downloads.length : 0
      });
    };

    const interval = setInterval(updateStatus, 3000);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status.online ? <FaWifi className="text-green-500" /> : <MdWifiOff className="text-red-500" />}
          <span className="font-medium">Network Status</span>
        </div>
        <Badge variant={status.online ? 'default' : 'destructive'}>
          {status.online ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-blue-500" />
            <span>Pending Messages</span>
          </div>
          <Badge>{status.messageQueue}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FaTasks className="text-purple-500" />
            <span>Pending Exercises</span>
          </div>
          <Badge>{status.exerciseQueue}</Badge>
        </div>

        {status.downloadProgress > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2">
                <FaCloudDownloadAlt className="text-orange-500" />
                <span>Downloads Progress</span>
              </div>
              <span>{Math.round(status.downloadProgress)}%</span>
            </div>
            <Progress value={status.downloadProgress} />
          </div>
        )}
      </div>
    </motion.div>
  );
}