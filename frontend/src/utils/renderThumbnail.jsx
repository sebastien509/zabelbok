 // src/utils/renderThumbnail.jsx
import React from 'react';
import Lottie from 'lottie-react';
import bgAnimation from '@/assets/bgAnimation.json';

/**
 * Renders a video thumbnail from Cloudinary or fallback animation.
 * 
 * @param {object} mod - Module object with `video_url`, `id`, etc.
 * @param {array} offlineSaved - List of module IDs that are saved offline.
 * @param {object} options - Optional config (e.g. width, height, cloudName).
 */
export function renderThumbnail(mod, offlineSaved = [], options = {}) {
  const { cloudName = 'dyeomcmin', width = 320, height = 180 } = options;

  const videoUrl = mod?.video_url;
  if (!videoUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-sm text-gray-500">
        No video
      </div>
    );
  }

  const publicId = videoUrl
    .replace(`https://res.cloudinary.com/${cloudName}/video/upload/`, '')
    .replace(/\.(mp4|mov|webm)$/i, ''); // Strip extension

  const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_1,fl_jpeg,w_${width},h_${height},c_fill/${publicId}.jpg`;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      <img
        src={thumbnailUrl}
        alt="Video Thumbnail"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <Lottie animationData={bgAnimation} loop className="absolute  h-44 inset-0 opacity-80 pointer-events-none" />
      {offlineSaved.includes(mod.id) && (
        <div className="absolute min-h-28 bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-2">
          <p className="text-xs text-white font-medium">Available Offline</p>
        </div>
      )}
    </div>
  );
}
