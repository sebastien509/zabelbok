import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import logoOverlay from '@/assets/react.svg';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VideoPlayer = forwardRef(({
  src,
  moduleId,
  onEnded,
  captionUrl,
  onProgress,
  onDurationChange,
  onTimeUpdate
}, ref) => {
  const navigate = useNavigate();
  const resumeKey = `module-progress-${moduleId}`;
  const isOffline = !navigator.onLine;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasOfflineBlob, setHasOfflineBlob] = useState(false);
  const internalVideoRef = useRef(null);

  const videoRef = useCallback((node) => {
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
    internalVideoRef.current = node;
  }, [ref]);

  useEffect(() => {
    const isBlobAvailable = src?.startsWith('blob:');
    setHasOfflineBlob(isBlobAvailable);
    if (isOffline && !isBlobAvailable) {
      setError('OFFLINE_CONTENT_UNAVAILABLE');
    }
  }, [src, isOffline]);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;

    let lastSaved = 0;

    const handleTimeUpdate = () => {
      const now = video.currentTime;
      onTimeUpdate?.(now);

      // Trigger manual end
      if (video.duration && now >= video.duration - 0.1) {
        localStorage.removeItem(resumeKey);
        onEnded?.();
      }

      if (now - lastSaved > 2) {
        try {
          localStorage.setItem(resumeKey, now.toString());
          lastSaved = now;
          if (onProgress && video.duration > 0) {
            onProgress(now / video.duration);
          }
        } catch (err) {
          console.error('Progress save error:', err);
        }
      }
    };

    const handleLoaded = () => {
      setLoading(false);
      const savedTime = parseFloat(localStorage.getItem(resumeKey));
      if (!isNaN(savedTime) && savedTime > 1 && savedTime < video.duration - 2) {
        video.currentTime = savedTime;
      }
      onDurationChange?.(video.duration);
    };

    const handleEnded = () => {
      localStorage.removeItem(resumeKey);
      onEnded?.();
    };

    const handleError = (e) => {
      console.error('[VideoPlayer] error:', e.target.error);
      setLoading(false);
      if (isOffline && !hasOfflineBlob) {
        setError('OFFLINE_CONTENT_UNAVAILABLE');
      } else {
        setError('Failed to load video');
      }
    };

    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [src, onEnded, onProgress, onDurationChange, onTimeUpdate]);

  const handleReturnToCourse = () => navigate('/learner/courses');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-4xl mx-auto bg-black rounded-xl overflow-hidden"
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Loader2 className="animate-spin text-white w-8 h-8" />
        </div>
      )}

      {error === 'OFFLINE_CONTENT_UNAVAILABLE' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
          <h3 className="text-2xl font-bold">Offline Module Not Available</h3>
          <p className="text-gray-300">
            This module hasn't been downloaded for offline use. Please connect to the internet to access this content.
          </p>
          <button
            onClick={handleReturnToCourse}
            className="mt-4 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Return to Course Page
          </button>
        </div>
      )}

      {error && error !== 'OFFLINE_CONTENT_UNAVAILABLE' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white p-4">
          <p className="text-lg font-medium mb-2">Video Playback Error</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              internalVideoRef.current?.load();
            }}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        controls
        controlsList="nodownload"
        className="w-full aspect-video"
        autoPlay
        playsInline
        disablePictureInPicture
      >
        {captionUrl && (
          <track src={captionUrl} kind="subtitles" srcLang="en" label="English" default />
        )}
      </video>

      {isOffline && hasOfflineBlob && (
        <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
          Offline Available
        </div>
      )}

      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 1 }}
        src={logoOverlay}
        alt="Watermark"
        className="absolute bottom-4 right-4 w-14 md:w-16 opacity-80 pointer-events-none"
      />
    </motion.div>
  );
});

export default VideoPlayer;
