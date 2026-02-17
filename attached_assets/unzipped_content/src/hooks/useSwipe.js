import { useRef, useCallback } from 'react';

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }) {
  const touchStart = useRef(null);

  const onTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}
