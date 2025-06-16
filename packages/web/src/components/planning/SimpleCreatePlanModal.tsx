import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, FileText, AlertCircle, Target, CheckCircle2, CalendarDays, Timer, MapPin } from 'lucide-react';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { User } from '@/types/user';
import { personalPlanService } from '@/services/PersonalPlanService';
import { autoPlanSyncService } from '@/services/AutoPlanSyncService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(new Date());
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    types: [] as string[],
    priority: 'normal',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    notes: '',
    visibility: 'personal'
  });

  // Auto-fill current date when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      setFormData({
        title: '',
        description: '',
        types: [],
        priority: 'normal',
        startDate: todayString,
        endDate: todayString,
        startTime: '09:00',
        endTime: '17:00',
        location: '',
        notes: '',
        visibility: 'personal'
      });

      setSelectedStartDate(today);
      setSelectedEndDate(today);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const planTypes = [
    { value: 'partner_new', label: '🤝 Đối tác mới', description: 'Tìm kiếm và phát triển đối tác mới' },
    { value: 'partner_old', label: '🤝 Đối tác cũ', description: 'Duy trì và phát triển đối tác hiện tại' },
    { value: 'architect_new', label: '🏗️ KTS mới', description: 'Tiếp cận kiến trúc sư mới' },
    { value: 'architect_old', label: '🏗️ KTS cũ', description: 'Chăm sóc kiến trúc sư hiện tại' },
    { value: 'client_new', label: '👥 Khách hàng mới', description: 'Tìm kiếm khách hàng mới' },
    { value: 'client_old', label: '👥 Khách hàng cũ', description: 'Chăm sóc khách hàng hiện tại' },
    { value: 'quote_new', label: '📋 KTS mới', description: 'Báo giá cho kiến trúc sư mới' },
    { value: 'quote_old', label: '📋 KTS cũ', description: 'Báo giá cho kiến trúc sư cũ' },
    { value: 'inventory', label: '📦 Kho hàng', description: 'Quản lý và kiểm tra kho hàng' },
    { value: 'other', label: '📝 Khác', description: 'Công việc khác' }
  ];

  const priorityOptions = [
    { value: 'low', label: '🟢 Thấp', color: 'text-green-600' },
    { value: 'normal', label: '🟡 Bình thường', color: 'text-yellow-600' },
    { value: 'high', label: '🟠 Cao', color: 'text-orange-600' },
    { value: 'urgent', label: '🔴 Khẩn cấp', color: 'text-red-600' }
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim() || !formData.description.trim() || formData.types.length === 0 || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc: Tiêu đề, Mô tả, Loại công việc, Ngày bắt đầu, Ngày kết thúc',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser?.id) {
      toast({
        title: 'Lỗi',
        description: 'Không xác định được người dùng',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Tạo kế hoạch mới
      const newPlan = personalPlanService.addPlan(currentUser.id, {
        title: formData.title,
        description: formData.description,
        type: formData.types[0] as any, // Lấy type đầu tiên
        status: 'pending',
        priority: formData.priority as any,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        notes: formData.notes || 'Tự động chuyển thành công việc khi đến hạn',
        participants: [],
        creator: currentUser.name
      });

      console.log('✅ Đã tạo kế hoạch:', newPlan.title);

      toast({
        title: 'Thành công',
        description: 'Đã tạo kế hoạch mới thành công! Kế hoạch sẽ tự động chuyển thành công việc khi đến hạn.',
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
    } catch (error) {
      console.error('Lỗi khi tạo kế hoạch:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo kế hoạch',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
          className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex-shrink-0 relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Tạo kế hoạch nhanh</h2>
                  <p className="text-blue-100 text-sm">Tự động chuyển thành công việc khi đến hạn</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 min-h-0 p-6 -mx-6 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tiêu đề */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Tiêu đề kế hoạch <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  name="title"
                  placeholder="Nhập tiêu đề kế hoạch..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm"
                  required
                />
              </div>

              {/* Mô tả */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Mô tả chi tiết <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Mô tả chi tiết về kế hoạch..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full p-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm resize-none"
                  required
                />
              </div>

              {/* Loại công việc */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Loại công việc <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {planTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeToggle(type.value)}
                      disabled={isSubmitting}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        formData.types.includes(type.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mức độ ưu tiên */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Mức độ ưu tiên
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => handleInputChange('priority', priority.value)}
                      disabled={isSubmitting}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        formData.priority === priority.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`font-medium text-sm ${priority.color}`}>{priority.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngày thực hiện */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Ngày bắt đầu <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-3 h-4 w-4 text-gray-500" />
                        {selectedStartDate ? (
                          format(selectedStartDate, 'dd/MM/yyyy', { locale: vi })
                        ) : (
                          <span className="text-gray-500">Chọn ngày bắt đầu</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border-gray-200 rounded-xl shadow-xl" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedStartDate}
                        onSelect={(date) => {
                          setSelectedStartDate(date);
                          if (date) {
                            handleInputChange('startDate', date.toISOString().split('T')[0]);
                          }
                          setIsStartCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        locale={vi}
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Hạn chót <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-3 h-4 w-4 text-gray-500" />
                        {selectedEndDate ? (
                          format(selectedEndDate, 'dd/MM/yyyy', { locale: vi })
                        ) : (
                          <span className="text-gray-500">Chọn hạn chót</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border-gray-200 rounded-xl shadow-xl" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedEndDate}
                        onSelect={(date) => {
                          setSelectedEndDate(date);
                          if (date) {
                            handleInputChange('endDate', date.toISOString().split('T')[0]);
                          }
                          setIsEndCalendarOpen(false);
                        }}
                        disabled={(date) => {
                          const startDate = selectedStartDate || new Date();
                          return date < startDate;
                        }}
                        initialFocus
                        locale={vi}
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Giờ bắt đầu <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full h-12 pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Giờ kết thúc
                  </label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full h-12 pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Địa điểm */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Địa điểm
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    name="location"
                    placeholder="Nhập địa điểm thực hiện..."
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-12 pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm"
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  placeholder="Thêm ghi chú hoặc hướng dẫn..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full p-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm resize-none"
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-6 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 -mx-6 -mb-6 rounded-b-3xl">
            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Tự động kích hoạt</p>
                  <p>Kế hoạch sẽ tự động chuyển thành công việc khi đến ngày bắt đầu.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tạo...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Tạo kế hoạch
                  </div>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SimpleCreatePlanModal;
