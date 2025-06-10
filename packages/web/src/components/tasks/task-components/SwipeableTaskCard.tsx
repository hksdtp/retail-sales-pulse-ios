import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import TaskCard from './TaskCard';
import { Task } from '../types/TaskTypes';

interface SwipeableTaskCardProps {
  task: Task;
  getTeamName?: (teamId: string) => string;
  getAssigneeName?: (userId: string) => string;
  onTaskClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onComplete?: (task: Task) => void;
}

const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  task,
  getTeamName,
  getAssigneeName,
  onTaskClick,
  onEdit,
  onDelete,
  onComplete,
}) => {
  const isMobile = useIsMobile();
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, -75, 0, 75, 150], [0.8, 0.9, 1, 0.9, 0.8]);
  const scale = useTransform(x, [-150, -75, 0, 75, 150], [0.95, 0.98, 1, 0.98, 0.95]);

  // Action button styles based on swipe direction
  const leftActionOpacity = useTransform(x, [-150, -75, 0], [1, 0.7, 0]);
  const rightActionOpacity = useTransform(x, [0, 75, 150], [0, 0.7, 1]);

  const handlePanStart = useCallback(() => {
    if (!isMobile) return;
    setIsSwipeActive(true);
  }, [isMobile]);

  const handlePan = useCallback((event: any, info: PanInfo) => {
    if (!isMobile) return;

    const threshold = 75;
    if (Math.abs(info.offset.x) > threshold) {
      setSwipeDirection(info.offset.x > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  }, [isMobile]);

  const handlePanEnd = useCallback(async (event: any, info: PanInfo) => {
    if (!isMobile) return;

    setIsSwipeActive(false);
    const threshold = 100;

    if (info.offset.x < -threshold) {
      // Swipe left - Show edit/delete actions
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      // Keep card in swiped position to show actions
      x.set(-150);
      setTimeout(() => {
        x.set(0);
      }, 2000); // Auto-reset after 2 seconds
    } else if (info.offset.x > threshold) {
      // Swipe right - Mark as completed
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      if (onComplete && task.status !== 'completed') {
        onComplete(task);
      }
      x.set(0);
    } else {
      // Return to center
      x.set(0);
    }

    setSwipeDirection(null);
  }, [isMobile, x, onComplete, task]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(task);
    }
    x.set(0);
  }, [onEdit, task, x]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(task);
    }
    x.set(0);
  }, [onDelete, task, x]);

  // If not mobile, render regular TaskCard
  if (!isMobile) {
    return (
      <TaskCard
        task={task}
        getTeamName={getTeamName}
        getAssigneeName={getAssigneeName}
        onTaskClick={onTaskClick}
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl" ref={constraintsRef}>
      {/* Left action buttons (Edit/Delete) */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center space-x-2 px-4 z-10"
        style={{ opacity: leftActionOpacity }}
      >
        <motion.button
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
          onClick={handleEdit}
          whileTap={{ scale: 0.9 }}
        >
          <Edit className="w-5 h-5 text-white" />
        </motion.button>
        <motion.button
          className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
          onClick={handleDelete}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-5 h-5 text-white" />
        </motion.button>
      </motion.div>

      {/* Right action indicator (Complete) */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-4 z-10"
        style={{ opacity: rightActionOpacity }}
      >
        <motion.div
          className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
          whileTap={{ scale: 0.9 }}
        >
          <Check className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      {/* Task Card */}
      <motion.div
        style={{
          x,
          opacity,
          scale,
        }}
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.1}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        className={`relative z-20 ${isSwipeActive ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <TaskCard
          task={task}
          getTeamName={getTeamName}
          getAssigneeName={getAssigneeName}
          onTaskClick={onTaskClick}
        />
      </motion.div>

      {/* Swipe hint overlay */}
      {isSwipeActive && (
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {swipeDirection === 'left' && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              ← Chỉnh sửa / Xóa
            </div>
          )}
          {swipeDirection === 'right' && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              Hoàn thành →
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SwipeableTaskCard;
