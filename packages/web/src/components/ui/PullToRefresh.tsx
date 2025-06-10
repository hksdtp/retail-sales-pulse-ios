import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, threshold], [0, 180]);
  const opacity = useTransform(y, [0, threshold / 2, threshold], [0, 0.5, 1]);
  const scale = useTransform(y, [0, threshold], [0.8, 1]);

  const handlePanStart = useCallback(() => {
    if (disabled || isRefreshing) return;
    
    // Chỉ cho phép pull-to-refresh khi ở đầu trang
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handlePan = useCallback((event: any, info: PanInfo) => {
    if (disabled || isRefreshing || !isPulling) return;

    const container = containerRef.current;
    if (container && container.scrollTop > 0) {
      setIsPulling(false);
      y.set(0);
      return;
    }

    // Chỉ cho phép kéo xuống
    if (info.offset.y > 0) {
      // Tạo hiệu ứng resistance khi kéo quá threshold
      const resistance = info.offset.y > threshold ? 0.3 : 1;
      y.set(info.offset.y * resistance);
    }
  }, [disabled, isRefreshing, isPulling, y, threshold]);

  const handlePanEnd = useCallback(async (event: any, info: PanInfo) => {
    if (disabled || isRefreshing || !isPulling) return;

    setIsPulling(false);

    if (info.offset.y >= threshold) {
      setIsRefreshing(true);
      
      // Haptic feedback (vibration) trên mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      try {
        await onRefresh();
        toast({
          title: "Đã cập nhật dữ liệu",
          description: "Dữ liệu đã được làm mới thành công",
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setIsRefreshing(false);
      }
    }

    // Animate về vị trí ban đầu
    y.set(0);
  }, [disabled, isRefreshing, isPulling, threshold, onRefresh, toast, y]);

  const pullDistance = useTransform(y, (value) => Math.min(value, threshold * 1.2));

  return (
    <div className="relative overflow-hidden">
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        style={{
          height: pullDistance,
          opacity,
        }}
      >
        <motion.div
          className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50"
          style={{
            scale,
            rotate: isRefreshing ? 0 : rotate,
          }}
        >
          <RefreshCw 
            className={`w-4 h-4 text-ios-blue ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="relative"
        style={{
          y: pullDistance,
        }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        drag={isPulling ? "y" : false}
        dragConstraints={{ top: 0, bottom: threshold * 1.2 }}
        dragElastic={0.1}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
