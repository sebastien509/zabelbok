import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function OfflineCourseDownloader() {
  const [downloading, setDownloading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setRole(res.data.role);
    });

    api.get('/auth/me/courses')
      .then(res => setAvailableCourses(res.data))
      .catch(err => console.error('Failed to load courses', err));
  }, []);

  const downloadZip = async (courseId) => {
    const isProfessor = role === 'professor' || role === 'admin';
    const endpoint = isProfessor
      ? `/offline/download/professor/${courseId}`
      : `/offline/download/${courseId}`;

    const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    const updated = [...downloads, { name: courseId, status: 'pending', progress: 0 }];
    localStorage.setItem('downloads', JSON.stringify(updated));

    try {
      setDownloading(true);
      const res = await api.get(endpoint, { responseType: 'blob' });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseId}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      const success = updated.map(d =>
        d.name === courseId ? { ...d, status: 'completed', completedAt: Date.now() } : d
      );
      localStorage.setItem('downloads', JSON.stringify(success));
    } catch (err) {
      const failed = updated.map(d =>
        d.name === courseId ? { ...d, status: 'failed', error: err.message } : d
      );
      localStorage.setItem('downloads', JSON.stringify(failed));
      alert('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm space-y-3">
      <h2 className="text-lg font-bold">📦 Offline Course Downloader</h2>

      {availableCourses.length === 0 && (
        <p className="text-gray-500">No courses available</p>
      )}

      {availableCourses.map((course) => {
        const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
        const current = downloads.find(d => d.name === course.id);

        const label = current?.status === 'completed'
          ? `✅ ${course.title} (Downloaded)`
          : `Download ${course.title}`;

        return (
          <button
            key={course.id}
            onClick={() => downloadZip(course.id)}
            className="block w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : label}
          </button>
        );
      })}
    </div>
  );
}
