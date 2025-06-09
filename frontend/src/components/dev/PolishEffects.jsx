// ✅ PolishEffects.jsx (Global UX Polish)
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

export default function PolishEffects() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate global sync listener
    const interval = setInterval(() => {
      if (!navigator.onLine) return;
      setIsSyncing(true);
      setProgress((p) => (p < 100 ? p + 20 : 100));

      if (progress >= 100) {
        setIsSyncing(false);
        setProgress(0);
        toast({ title: 'Offline Data Synced ✅' });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <AnimatePresence>
      {isSyncing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow z-50"
        >
          Syncing... {progress}%
        </motion.div>
      )}
    </AnimatePresence>
  );
}
