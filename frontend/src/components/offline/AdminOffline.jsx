// src/pages/admin/AdminOffline.jsx
import OfflineStatusPanel from "../system/OfflineStatusPanel";

export default function AdminOffline() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold">Admin Offline Overview</h1>
      <p className="text-sm text-gray-600">Admins do not interact directly with content, but can view system queues and network status here.</p>
      <OfflineStatusPanel />
    </div>
  );
}
