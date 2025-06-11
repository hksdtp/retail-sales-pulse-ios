import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SwipeConfig {
  threshold?: number; // Minimum distance for swipe
  velocity?: number;  // Minimum velocity for swipe
  preventScroll?: boolean; // Prevent default scroll behavior
}

const defaultConfig: SwipeConfig = {
  threshold: 50,
  velocity: 0.3,
  preventScroll: true
};

export const useSwipeNavigation = (config: SwipeConfig = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const configRef = useRef({ ...defaultConfig, ...config });

  // Define navigation routes in order
  const routes = [
    '/',
    '/tasks', 
    '/calendar',
    '/curtain-design',
    '/employees'
  ];

  const getCurrentIndex = () => {
    return routes.indexOf(location.pathname);
  };

  const navigateToIndex = (index: number) => {
    if (index >= 0 && index < routes.length) {
      navigate(routes[index]);
      
      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    const distance = Math.abs(deltaX);
    const velocity = distance / deltaTime;

    // Check if it's a horizontal swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartRef.current = null;
      return;
    }

    // Check threshold and velocity
    if (distance < configRef.current.threshold! || velocity < configRef.current.velocity!) {
      touchStartRef.current = null;
      return;
    }

    const currentIndex = getCurrentIndex();
    
    if (deltaX > 0) {
      // Swipe right - go to previous page
      navigateToIndex(currentIndex - 1);
    } else {
      // Swipe left - go to next page  
      navigateToIndex(currentIndex + 1);
    }

    touchStartRef.current = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (configRef.current.preventScroll && touchStartRef.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // If horizontal movement is greater, prevent vertical scroll
      if (deltaX > deltaY) {
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    // Only enable on mobile devices
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [location.pathname]);

  return {
    currentIndex: getCurrentIndex(),
    totalPages: routes.length,
    canGoBack: getCurrentIndex() > 0,
    canGoForward: getCurrentIndex() < routes.length - 1,
    goToPage: navigateToIndex,
    routes
  };
};
