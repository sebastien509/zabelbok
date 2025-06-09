// src/components/QueueBadge.jsx
import { useQueueBadge } from "@/hook/useQueueBadge";
export default function QueueBadge() {
  const { grouped, isOffline } = useQueueBadge();

  if (Object.keys(grouped).length === 0 && !isOffline) return null;

  return (
    <div className="fixed glass bottom-4 right-4 bg-yellow-500 text-white rounded px-4 py-2 shadow-lg space-y-1">
      {isOffline && <div>You are offline</div>}
      {Object.keys(grouped).length > 0 && (
        <div>
          {Object.entries(grouped).map(([type, count]) => (
            <div key={type}>{count} {type.replace('_', ' ')}{count > 1 ? 's' : ''} queued</div>
          ))}
        </div>
      )}
    </div>
  );
}
