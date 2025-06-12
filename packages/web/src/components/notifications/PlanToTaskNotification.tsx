import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  ArrowRight, 
  X, 
  Calendar,
  ListTodo,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlanToTaskNotificationProps {
  isVisible: boolean;
  planTitle: string;
  taskTitle: string;
  onClose: () => void;
  onViewTask?: () => void;
}

const PlanToTaskNotification: React.FC<PlanToTaskNotificationProps> = ({
  isVisible,
  planTitle,
  taskTitle,
  onClose,
  onViewTask
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      // Tự động ẩn sau 8 giây
      const timer = setTimeout(() => {
        setShouldShow(false);
        setTimeout(onClose, 300); // Đợi animation kết thúc
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setShouldShow(false);
    setTimeout(onClose, 300);
  };

  const handleViewTask = () => {
    if (onViewTask) {
      onViewTask();
    }
    handleClose();
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed top-4 right-4 z-50 w-96 max-w-[90vw]"
        >
          <Card className="bg-white shadow-lg border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        Kế hoạch
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <ListTodo className="w-3 h-3 mr-1" />
                        Công việc
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      Kế hoạch đã chuyển thành công việc
                    </h4>
                    
                    <p className="text-xs text-gray-600 mb-3">
                      <span className="font-medium">"{planTitle}"</span> đã được tự động chuyển thành công việc cần thực hiện
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={handleViewTask}
                  className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <ListTodo className="w-3 h-3 mr-1" />
                  Xem công việc
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 text-xs"
                >
                  Đóng
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanToTaskNotification;
