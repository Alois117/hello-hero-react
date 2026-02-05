import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  timeoutMinutes: number;
  onIdle: () => void;
  enabled: boolean;
  userId?: string;
  username?: string;
  email?: string;
}

/**
 * Hook to handle idle timeout with proper cleanup and activity tracking.
 * Only triggers logout after genuine inactivity period.
 */
export const useIdleTimeout = ({
  timeoutMinutes,
  onIdle,
  enabled,
  userId,
  username,
  email,
}: UseIdleTimeoutOptions): void => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearIdleTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleIdleTimeout = useCallback(() => {
    const idleDuration = Date.now() - lastActivityRef.current;
    const expectedTimeout = timeoutMinutes * 60 * 1000;

    // Only trigger if we've actually been idle for the expected duration
    if (idleDuration >= expectedTimeout - 1000) { // 1 second tolerance
      onIdle();
    } else {
      // Activity happened, reschedule
      startIdleTimer();
    }
  }, [timeoutMinutes, onIdle]);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    timeoutRef.current = setTimeout(handleIdleTimeout, timeoutMinutes * 60 * 1000);
  }, [clearIdleTimer, handleIdleTimeout, timeoutMinutes]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (enabled) {
      startIdleTimer();
    }
  }, [enabled, startIdleTimer]);

  useEffect(() => {
    if (!enabled) {
      clearIdleTimer();
      return;
    }

    // User interaction events that reset idle timer
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'keypress',
      'scroll',
      'touchstart',
      'touchmove',
      'click',
      'focus',
    ];

    // Throttled activity handler to prevent excessive timer resets
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledResetActivity = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        resetActivity();
      }, 1000); // Throttle to once per second
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledResetActivity, { passive: true });
    });

    // Also listen for visibility changes (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the initial timer
    startIdleTimer();

    // Cleanup
    return () => {
      clearIdleTimer();
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledResetActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startIdleTimer, resetActivity, clearIdleTimer]);
};

export default useIdleTimeout;
