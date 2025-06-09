import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';
import { useState , useEffect} from 'react';


export default function DownloadManager() {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    const updateDownloads = () => {
      const stored = JSON.parse(localStorage.getItem('downloads') || [])
      // Auto-clean completed downloads older than 1 hour
      const cleaned = stored.filter(d => 
        d.status !== 'completed' || 
        Date.now() - (d.completedAt || 0) < 60 * 60 * 1000
      );
      setDownloads(cleaned);
      localStorage.setItem('downloads', JSON.stringify(cleaned));
    };

    const interval = setInterval(updateDownloads, 2000);
    return () => clearInterval(interval);
  }, []);

  const retryDownload = (id) => {
    const updated = downloads.map(d => 
      d.id === id ? { ...d, status: 'pending', progress: 0 } : d
    );
    setDownloads(updated);
    localStorage.setItem('downloads', JSON.stringify(updated));
  };

  const removeDownload = (id) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('downloads', JSON.stringify(updated));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Download Queue</h3>
        <Badge>{downloads.filter(d => d.status === 'completed').length}/{downloads.length}</Badge>
      </div>

      <AnimatePresence>
        {downloads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 text-sm text-muted-foreground"
          >
            No active downloads
          </motion.div>
        ) : (
          <div className="space-y-3">
            {downloads.map((download) => (
              <motion.div
                key={download.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 border rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm truncate">{download.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      download.status === 'completed' ? 'default' :
                      download.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {download.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeDownload(download.id)}
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <Progress 
                  value={download.progress || (download.status === 'completed' ? 100 : 0)} 
                  className="h-2"
                />
                
                {download.status === 'failed' && (
                  <div className="mt-2 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => retryDownload(download.id)}
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Retry
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}