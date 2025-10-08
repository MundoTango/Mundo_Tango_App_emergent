import { useState, useEffect } from 'react';
import { useOpenReplay } from '@/hooks/useOpenReplay';

export function SessionRecordingNotice() {
  const { isRecording } = useOpenReplay();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('session-recording-notice-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!isRecording || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('session-recording-notice-dismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm glassmorphic-card p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium">Session Recording Active</h4>
          <p className="text-xs text-gray-600 mt-1">
            We're recording this session to improve your experience. 
            Your privacy is protected - sensitive data is automatically redacted.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss" data-testid="button-text-gray-400">

          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>);

}