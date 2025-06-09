import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

export default function SecureContainer({ children, onViolation }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [focusLost, setFocusLost] = useState(0);
  const [clipboardBlocked, setClipboardBlocked] = useState(false);
  const [attemptedFullscreen, setAttemptedFullscreen] = useState(false);
  const [toasts, setToasts] = useState([]);

  console.log('[SecureContainer] Rendered. Fullscreen state:', fullscreen);

  // Custom toast system
  const showToast = useCallback((title, description, variant = 'default') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  // Check fullscreen state
  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen = !!document.fullscreenElement;
      console.log('[SecureContainer] Fullscreen change detected:', isFullscreen);
      if (isFullscreen !== fullscreen) {
        setFullscreen(isFullscreen);
      }
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => {
      console.log('[SecureContainer] Cleaning up fullscreen listener');
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, [fullscreen]);

  // Security features
  useEffect(() => {
    if (!fullscreen) {
      console.log('[SecureContainer] Security features inactive (not fullscreen)');
      return;
    }

    console.log('[SecureContainer] Activating security features');

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[SecureContainer] Tab focus lost detected');
        setFocusLost(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            console.log('[SecureContainer] Maximum violations reached');
            showToast('Quiz Terminated', 'Too many tab switches', 'destructive');
            if (typeof onViolation === 'function') {
              onViolation('multiple_tab_switches');
            }
          } else {
            showToast('Warning', `Tab switch detected (${newCount}/3)`, 'warning');
          }
          return newCount;
        });
      }
    };

    const handleCopy = (e) => {
      e.preventDefault();
      if (!clipboardBlocked) {
        console.log('[SecureContainer] Copy attempt blocked');
        setClipboardBlocked(true);
        showToast('Copying Disabled', 'Text selection is disabled', 'destructive');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      console.log('[SecureContainer] Cleaning up security listeners');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [fullscreen, clipboardBlocked, onViolation, showToast]);

  const handleFullscreenRequest = async () => {
    console.log('[SecureContainer] Fullscreen button clicked');
    try {
      setAttemptedFullscreen(true);
      console.log('[SecureContainer] Attempting to enter fullscreen...');
      await document.documentElement.requestFullscreen();
      console.log('[SecureContainer] Fullscreen successfully entered');
      setFullscreen(true);
    } catch (err) {
      console.error('[SecureContainer] Fullscreen error:', err);
      showToast('Fullscreen Required', 'Please allow fullscreen mode', 'destructive');
    }
  };

  if (!fullscreen) {
    console.log('[SecureContainer] Showing fullscreen prompt UI');
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Fullscreen Required</h2>
          <p className="mb-6">You must enable fullscreen mode to continue the assessment.</p>
          
          <Button
            onClick={handleFullscreenRequest}
            className="w-full py-3 text-lg"
          >
            Enable Fullscreen
          </Button>

          {attemptedFullscreen && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Need help?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Check browser permission settings</li>
                <li>• Click the lock icon in your address bar</li>
                <li>• Use Chrome/Firefox for best results</li>
              </ul>
            </div>
          )}
        </div>

        {/* Toast notifications */}
        {toasts.map(toast => (
          <ToastNotification key={toast.id} {...toast} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-50">
      {/* Security indicators */}
      {clipboardBlocked && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-300 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
          Clipboard Blocked
        </div>
      )}
      {focusLost > 0 && (
        <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
          Warnings: {focusLost}/3
        </div>
      )}

      {/* Main content */}
      <div style={{ userSelect: clipboardBlocked ? 'none' : 'auto' }}>
        {children}
      </div>

      {/* Toast notifications */}
      {toasts.map(toast => (
        <ToastNotification key={toast.id} {...toast} />
      ))}
    </div>
  );
}

function ToastNotification({ title, description, variant }) {
  const variantStyles = {
    destructive: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    default: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border ${variantStyles[variant]}`}>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}