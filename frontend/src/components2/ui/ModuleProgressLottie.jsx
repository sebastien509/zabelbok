import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '@/assets/ProgressAnimation.json'; // Direct import

export default function ModuleProgressLottie({ progress, className = '' }) {
  const lottieRef = useRef(null);
  const isComplete = progress >= 1;
  const progressPercent = Math.round(progress * 100);

  // Play animation when completed
  useEffect(() => {
    if (isComplete && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [isComplete]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Minimal progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-2 overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Completion animation - only shows at 100% */}
      {isComplete && (
        <div className="relative w-16 h-16">
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData} // Use directly imported JSON
            loop={false}
            autoplay={false}
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">Done</span>
          </div>
        </div>
      )}

      {/* Progress percentage */}
      {!isComplete && (
        <p className="text-xs text-gray-500">
          {progressPercent}% complete
        </p>
      )}
    </div>
  );
}