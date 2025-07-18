import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  AlertCircle,
  Plus,
  Minus,
  CalendarDays,
  Timer,
  Target,
  CheckCircle2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { User } from '@/types/user';
import { personalPlanService } from '@/services/PersonalPlanService';
import { autoPlanSyncService } from '@/services/AutoPlanSyncService';
import { useToast } from '@/hooks/use-toast';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onPlanCreated?: () => void; // Callback để refresh data
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose, currentUser, onPlanCreated }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(new Date());
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    startDate: '',
    endDate: '',
    // Optional fields with defaults
    description: '',
    priority: 'normal',
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    notes: '',
    participants: [] as string[]
  });

  const [newParticipant, setNewParticipant] = useState('');

  // Auto-fill current date when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = today.toTimeString().slice(0, 5); // HH:MM format

      setFormData({
        title: '',
        type: '',
        startDate: todayString,
        endDate: todayString,
        description: '',
        priority: 'normal',
        startTime: currentTime,
        endTime: '17:00',
        location: '',
        notes: '',
        participants: []
      });

      setSelectedStartDate(today);
      setSelectedEndDate(today);
      setNewParticipant('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Mock danh sách nhân viên
  const availableEmployees = [
    'Khổng Đức Mạnh',
    'Lương Việt Anh', 
    'Lê Khánh Duy',
    'Phạm Thị Hương',
    'Nguyễn Thị Thảo',
    'Trịnh Thị Bốn',
    'Lê Tiến Quân',
    'Quản Thu Hà',
    'Nguyễn Thị Nga',
    'Phùng Thị Thuỳ Vân',
    'Nguyễn Ngọc Việt Khanh',
    'Hà Nguyễn Thanh Tuyền'
  ];

  const planTypes = [
    { value: 'personal', label: '👤 Cá nhân', description: 'Kế hoạch cá nhân' },
    { value: 'team', label: '👥 Nhóm', description: 'Kế hoạch nhóm/team' },
    { value: 'department', label: '🏢 Toàn phòng', description: 'Kế hoạch toàn phòng ban' },
    { value: 'meeting', label: '🤝 Họp', description: 'Cuộc họp nội bộ hoặc với khách hàng' },
    { value: 'training', label: '📚 Đào tạo', description: 'Tham gia hoặc tổ chức đào tạo' },
    { value: 'report', label: '📊 Báo cáo', description: 'Tạo và trình bày báo cáo' },
    { value: 'other', label: '📝 Khác', description: 'Kế hoạch khác' }
  ];

  const priorities = [
    { value: 'urgent', label: 'Khẩn cấp', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'high', label: 'Cao', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'normal', label: 'Bình thường', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'low', label: 'Thấp', color: 'bg-green-100 text-green-800 border-green-200' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addParticipant = (participant: string) => {
    if (participant && !formData.participants.includes(participant)) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, participant]
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (participant: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participant)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - chỉ cần 4 trường chính
    if (!formData.title.trim() || !formData.type || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc: Tiêu đề, Loại, Ngày bắt đầu, Ngày kết thúc',
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
      // Tạo kế hoạch mới trong personal workspace
      const newPlan = personalPlanService.addPlan(currentUser.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type as any,
        status: 'pending',
        priority: formData.priority as any || 'normal',
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        startTime: formData.startTime,
        endTime: formData.endTime || formData.startTime,
        location: formData.location,
        notes: formData.notes,
        participants: formData.participants,
        creator: currentUser.name
      });

      toast({
        title: 'Thành công',
        description: 'Đã tạo kế hoạch mới thành công',
      });

      // Callback để refresh data
      if (onPlanCreated) {
        onPlanCreated();
      }

      // Force refresh calendar plans
      if ((window as any).refreshCalendarPlans) {
        (window as any).refreshCalendarPlans();
      }

      // Force refresh ModernCalendar
      if ((window as any).refreshModernCalendar) {
        (window as any).refreshModernCalendar();
      }

      // Force refresh plan list if exists
      if ((window as any).refreshPlanList) {
        (window as any).refreshPlanList();
      }

      // Trigger auto-sync ngay lập tức
      
      autoPlanSyncService.manualSync(currentUser.id)
        .then(() => {
          
        })
        .catch((error) => {
          console.error('❌ Error in auto-sync after plan creation:', error);
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
      <div className="fixed inset-0 z-[99999] flex items-center justify-center">
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
          className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Tạo kế hoạch mới</h2>
                  <p className="text-blue-100 text-sm">Lập kế hoạch chi tiết và tự động chuyển thành công việc</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="py-6 px-6 -mx-6 max-h-[60vh] overflow-y-auto custom-scrollbar" style={{ position: 'relative' }}>
            <form onSubmit={handleSubmit} className="space-y-8">
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
                  className="w-full h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm"
                  required
                />
              </div>

              {/* Mô tả */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Mô tả chi tiết <span className="text-red-500 ml-1">*</span>
                </label>
                <Textarea
                  name="description"
                  placeholder="Mô tả chi tiết về kế hoạch, mục tiêu, yêu cầu..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full min-h-[120px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl resize-none transition-all duration-200 hover:bg-white hover:shadow-sm"
                  required
                />
              </div>

              {/* Loại và Độ ưu tiên */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Loại kế hoạch <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="w-full h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                      <SelectValue placeholder="Chọn loại kế hoạch" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 rounded-xl shadow-xl">
                      {planTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="hover:bg-blue-50 rounded-lg">
                          <div className="flex flex-col">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-gray-500">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Độ ưu tiên</label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="w-full h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                      <SelectValue placeholder="Chọn độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 rounded-xl shadow-xl">
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value} className="hover:bg-blue-50 rounded-lg">
                          <Badge className={priority.color}>{priority.label}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Ngày bắt đầu <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
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
                    Ngày kết thúc <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-3 h-4 w-4 text-gray-500" />
                        {selectedEndDate ? (
                          format(selectedEndDate, 'dd/MM/yyyy', { locale: vi })
                        ) : (
                          <span className="text-gray-500">Chọn ngày kết thúc</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="w-full h-12 pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"
                      required
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Giờ kết thúc</label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="w-full h-12 pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"
                    />
                  </div>
                </div>
              </div>

            {/* Địa điểm */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">Địa điểm</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Nhập địa điểm tổ chức..."
              />
            </div>

            {/* Người tham gia */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Người tham gia</Label>
              <div className="flex gap-2">
                <Select value={newParticipant} onValueChange={setNewParticipant}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Chọn người tham gia" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees
                      .filter(emp => !formData.participants.includes(emp))
                      .map((employee) => (
                        <SelectItem key={employee} value={employee}>
                          {employee}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={() => addParticipant(newParticipant)}
                  disabled={!newParticipant}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.participants.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.participants.map((participant) => (
                    <Badge key={participant} variant="secondary" className="flex items-center gap-1">
                      {participant}
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant)}
                        className="ml-1 hover:text-red-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Ghi chú */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Ghi chú thêm..."
                rows={2}
              />
            </div>

            </form>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 bg-gray-50/50 backdrop-blur-sm border-t border-gray-200/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePlanModal;
