import { useEffect } from 'react';

/**
 * Hook để quản lý scroll lock khi modal/overlay mở
 * Ngăn chặn scroll propagation từ modal xuống background
 */
export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Lưu trữ scroll position hiện tại
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;

      // Lưu trữ style gốc
      const originalBodyStyle = body.style.cssText;
      const originalHtmlStyle = html.style.cssText;

      // Áp dụng scroll lock với requestAnimationFrame để đảm bảo timing
      requestAnimationFrame(() => {
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.overflow = 'hidden';
        body.style.width = '100%';

        // Ngăn chặn scroll trên html element
        html.style.overflow = 'hidden';
      });

      // Cleanup function
      return () => {
        // Khôi phục style gốc với requestAnimationFrame
        requestAnimationFrame(() => {
          body.style.cssText = originalBodyStyle;
          html.style.cssText = originalHtmlStyle;

          // Khôi phục scroll position
          window.scrollTo(0, scrollY);
        });
      };
    }
  }, [isLocked]);
};

/**
 * Hook để ngăn chặn scroll event propagation trong modal content
 */
export const useModalScrollHandler = () => {
  const handleModalScroll = (e: React.WheelEvent | React.TouchEvent) => {
    // Ngăn chặn event bubbling lên parent elements
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Nếu là wheel event (desktop)
    if ('deltaY' in e) {
      const deltaY = e.deltaY;
      
      // Nếu scroll lên và đã ở đầu trang
      if (deltaY < 0 && scrollTop === 0) {
        e.preventDefault();
        return;
      }
      
      // Nếu scroll xuống và đã ở cuối trang
      if (deltaY > 0 && scrollTop + clientHeight >= scrollHeight) {
        e.preventDefault();
        return;
      }
    }
    
    // Nếu là touch event (mobile)
    if ('touches' in e) {
      // Cho phép scroll bình thường trong modal content
      // nhưng ngăn chặn propagation
      return;
    }
  };
  
  const handleModalTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Nếu content không cần scroll, ngăn chặn hoàn toàn
    if (scrollHeight <= clientHeight) {
      e.preventDefault();
      return;
    }
    
    // Nếu ở đầu hoặc cuối, ngăn chặn over-scroll
    if (scrollTop === 0 || scrollTop + clientHeight >= scrollHeight) {
      const touch = e.touches[0];
      const startY = touch.clientY;
      
      // Lưu trữ vị trí touch ban đầu để xử lý direction
      (target as any)._touchStartY = startY;
    }
  };
  
  return {
    handleModalScroll,
    handleModalTouchMove,
  };
};
