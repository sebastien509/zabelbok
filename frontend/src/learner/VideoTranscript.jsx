import React, { useState, useRef, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function VideoTranscript({
  transcript,
  currentTime, 
  duration,
  onSeek
}) {
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);
  const [showFull, setShowFull] = useState(false);

  // Memoize parsed transcript lines
  const { timeCoded, lines } = React.useMemo(() => {
    const lines = transcript?.split('\n').filter(line => line.trim()) || [];
    const timeCoded = lines.map(line => {
      const timeMatch = line.match(/^(\d+:\d+:\d+)\s+(.*)/);
      return timeMatch ? { 
        time: timeMatch[1], 
        text: timeMatch[2],
        seconds: convertTimeToSeconds(timeMatch[1])
      } : null;
    }).filter(Boolean);
    return { timeCoded, lines };
  }, [transcript]);

  // Find current line based on video time
  const currentLineIndex = React.useMemo(() => {
    return timeCoded.findIndex((line, i) => {
      const nextLine = timeCoded[i + 1];
      const nextTime = nextLine ? nextLine.seconds : duration;
      return currentTime >= line.seconds && currentTime < nextTime;
    });
  }, [currentTime, timeCoded, duration]);

  // Auto-scroll to current line
  useEffect(() => {
    if (autoScroll && scrollRef.current && currentLineIndex >= 0) {
      const lineElement = scrollRef.current.querySelector(`[data-line="${currentLineIndex}"]`);
      if (lineElement) {
        lineElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentLineIndex, autoScroll]);

  // Convert HH:MM:SS to seconds
  function convertTimeToSeconds(timeString) {
    const parts = timeString.split(':').map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Transcript
        </h2>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span>Auto-scroll</span>
        </label>
      </div>

      <ScrollArea 
        ref={scrollRef}
        className="h-60 rounded-md border p-3"
        onWheel={() => setAutoScroll(false)}
        onTouchMove={() => setAutoScroll(false)}
      >
        {timeCoded.length > 0 ? (
          <div className="space-y-2">
            {timeCoded.map((line, index) => (
              <div
                key={index}
                data-line={index}
                className={`p-2 rounded-md transition-colors ${
                  index === currentLineIndex 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  onSeek(line.seconds);
                  setAutoScroll(true);
                }}
              >
                <div className="flex gap-3">
                  <span className="text-xs text-gray-500 font-mono shrink-0">
                    {line.time}
                  </span>
                  <p className="text-sm text-gray-700 cursor-pointer">
                    {line.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {transcript || 'No transcript available'}
          </p>
        )}
      </ScrollArea>

      {!showFull && lines.length > 5 && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setShowFull(true)}
          className="mt-2 text-blue-600 hover:text-blue-800 px-0"
        >
          Show full transcript
        </Button>
      )}
    </div>
  );
}