// src/components/offline/StudentOffline.jsx
import OfflineStatusPanel from '../system/OfflineStatusPanel';
import OfflineLibraryViewer from './viewers/OfflineLibraryViewer';
import OfflineCourseDownloader from './OfflineCourseDownloader';

export default function StudentOffline() {
  return (
    <div className="space-y-6 p-4">
      <OfflineStatusPanel />
      <OfflineCourseDownloader/>
      <OfflineLibraryViewer />
    </div>
  );
}
