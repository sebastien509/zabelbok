// ✅ src/dashboard/AdminDashboard.jsx
import { motion } from 'framer-motion';
import SyncStatusBadge from '@/components/system/SyncStatusBadge';
import BackgroundSyncService from '@/components/system/BackgroundSyncService';
import MiniDownloadManager from '@/components/system/MiniDownloadManager';
import MiniSyncLogOverlay from '@/components/system/MiniSyncLogOverlay';
import ActivityTracker from '@/components/analytics/ActivityTracker';

export default function AdminDashboard() {
  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <BackgroundSyncService />
      <MiniDownloadManager />
      <MiniSyncLogOverlay />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <SyncStatusBadge queueKey="messageQueue" />
        </div>

        <ActivityTracker />
      </motion.div>
    </div>
  );
}