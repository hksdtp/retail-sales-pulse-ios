import React, { useEffect } from 'react';

/**
 * Mobile Optimizations Component
 * Provides mobile-specific optimizations and utilities
 */
const MobileOptimizations: React.FC = () => {
  useEffect(() => {
    // Prevent iOS zoom on input focus
    const preventZoom = () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        if (input instanceof HTMLElement) {
          const currentFontSize = window.getComputedStyle(input).fontSize;
          const fontSize = parseFloat(currentFontSize);
          if (fontSize < 16) {
            input.style.fontSize = '16px';
          }
        }
      });
    };

    // Enhanced touch feedback
    const addTouchFeedback = () => {
      const touchElements = document.querySelectorAll('button, [role="button"], a, .card');
      touchElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.touchAction = 'manipulation';
          element.style.webkitTapHighlightColor = 'transparent';
        }
      });
    };

    // Optimize scrolling performance
    const optimizeScrolling = () => {
      const scrollElements = document.querySelectorAll('.overflow-y-auto, main, .mobile-scroll');
      scrollElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.webkitOverflowScrolling = 'touch';
          element.style.scrollBehavior = 'smooth';
          element.style.overscrollBehavior = 'contain';
        }
      });
    };

    // Safe area support
    const applySafeAreas = () => {
      const root = document.documentElement;
      
      // Set CSS custom properties for safe areas
      root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    };

    // Viewport height fix for mobile browsers
    const fixViewportHeight = () => {
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);
      
      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
      };
    };

    // Apply all optimizations
    preventZoom();
    addTouchFeedback();
    optimizeScrolling();
    applySafeAreas();
    const cleanupVH = fixViewportHeight();

    // Reapply optimizations when DOM changes
    const observer = new MutationObserver(() => {
      preventZoom();
      addTouchFeedback();
      optimizeScrolling();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      cleanupVH?.();
    };
  }, []);

  return null; // This component doesn't render anything
};

/**
 * Hook for mobile detection
 */
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setOrientation(height > width ? 'portrait' : 'landscape');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return { isMobile, isTablet, orientation };
};

/**
 * Hook for haptic feedback on mobile devices
 */
export const useHapticFeedback = () => {
  const triggerHaptic = React.useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return triggerHaptic;
};

/**
 * Mobile-optimized button component
 */
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  haptic?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  haptic = true,
  className = '',
  onClick,
  ...props
}) => {
  const triggerHaptic = useHapticFeedback();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic) {
      triggerHaptic('light');
    }
    onClick?.(e);
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 touch-manipulation active:scale-95';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default MobileOptimizations;
