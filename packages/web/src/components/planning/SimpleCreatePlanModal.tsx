import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, FileText, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { User } from '@/types/user';
import { personalPlanService } from '@/services/PersonalPlanService';
import { autoPlanSyncService } from '@/services/AutoPlanSyncService';

interface SimpleCreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onPlanCreated?: () => void;
}

const SimpleCreatePlanModal: React.FC<SimpleCreatePlanModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onPlanCreated 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  // Auto-fill current date when modal opens
  useEffect(() => {
    if (isOpen && !formData.startDate) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      setFormData(prev => ({
        ...prev,
        startDate: todayString,
        endDate: todayString
      }));
    }
  }, [isOpen]);

  const planTypes = [
    { value: 'personal', label: '👤 Cá nhân', description: 'Kế hoạch cá nhân' },
    { value: 'team', label: '👥 Nhóm', description: 'Kế hoạch nhóm/team' },
    { value: 'department', label: '🏢 Toàn phòng', description: 'Kế hoạch toàn phòng ban' },
    { value: 'meeting', label: '🤝 Họp', description: 'Cuộc họp nội bộ hoặc với khách hàng' },
    { value: 'training', label: '📚 Đào tạo', description: 'Tham gia hoặc tổ chức đào tạo' },
    { value: 'report', label: '📊 Báo cáo', description: 'Tạo và trình bày báo cáo' },
    { value: 'other', label: '📝 Khác', description: 'Kế hoạch khác' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - chỉ cần 4 trường chính
    if (!formData.title || !formData.type || !formData.startDate || !formData.endDate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc: Tiêu đề, Loại, Ngày bắt đầu, Ngày kết thúc');
      return;
    }

    if (!currentUser?.id) {
      alert('Lỗi: Không xác định được người dùng');
      return;
    }

    try {
      // Tạo kế hoạch mới với thông tin đơn giản
      const newPlan = personalPlanService.addPlan(currentUser.id, {
        title: formData.title,
        description: `Kế hoạch ${formData.type} từ ${formData.startDate} đến ${formData.endDate}`,
        type: formData.type as any,
        status: 'pending',
        priority: 'normal',
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: '09:00',
        endTime: '17:00',
        location: '',
        notes: 'Tự động chuyển thành công việc khi đến hạn',
        participants: [],
        creator: currentUser.name
      });

      console.log('✅ Đã tạo kế hoạch:', newPlan.title);

      // Reset form
      setFormData({
        title: '',
        type: '',
        startDate: '',
        endDate: ''
      });

      // Callback để refresh data
      if (onPlanCreated) {
        onPlanCreated();
      }

      // Force refresh ModernCalendar
      if ((window as any).refreshModernCalendar) {
        (window as any).refreshModernCalendar();
      }

      // Force refresh other components
      if ((window as any).refreshCalendarPlans) {
        (window as any).refreshCalendarPlans();
      }

      if ((window as any).refreshPlanList) {
        (window as any).refreshPlanList();
      }

      // Trigger auto-sync
      console.log('🚀 Triggering auto-sync after plan creation...');
      autoPlanSyncService.manualSync(currentUser.id)
        .then(() => {
          console.log('✅ Auto-sync completed');
        })
        .catch((error) => {
          console.error('❌ Error in auto-sync:', error);
        });

      onClose();
      alert('Tạo kế hoạch thành công! Kế hoạch sẽ tự động chuyển thành công việc khi đến hạn.');
    } catch (error) {
      console.error('Lỗi khi tạo kế hoạch:', error);
      alert('Có lỗi xảy ra khi tạo kế hoạch. Vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📅 Tạo kế hoạch mới</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tiêu đề */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Tiêu đề kế hoạch <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nhập tiêu đề kế hoạch..."
                className="w-full"
              />
            </div>

            {/* Loại kế hoạch */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Loại kế hoạch <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại kế hoạch" />
                </SelectTrigger>
                <SelectContent>
                  {planTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ngày bắt đầu và kết thúc */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Tự động kích hoạt</p>
                  <p>Kế hoạch sẽ tự động chuyển thành công việc khi đến ngày bắt đầu.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Tạo kế hoạch
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SimpleCreatePlanModal;
