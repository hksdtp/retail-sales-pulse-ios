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
  Minus
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
import { User } from '@/types/user';
import { personalPlanService } from '@/services/PersonalPlanService';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onPlanCreated?: () => void; // Callback để refresh data
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose, currentUser, onPlanCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    participants: [] as string[]
  });

  const [newParticipant, setNewParticipant] = useState('');

  // Auto-fill current date when modal opens
  useEffect(() => {
    if (isOpen && !formData.startDate) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = today.toTimeString().slice(0, 5); // HH:MM format

      setFormData(prev => ({
        ...prev,
        startDate: todayString,
        startTime: currentTime
      }));
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
    { value: 'meeting', label: '🤝 Họp', description: 'Cuộc họp, thảo luận' },
    { value: 'site_visit', label: '🏗️ Khảo sát', description: 'Khảo sát địa điểm, dự án' },
    { value: 'report', label: '📊 Báo cáo', description: 'Báo cáo, thuyết trình' },
    { value: 'training', label: '📚 Đào tạo', description: 'Đào tạo, học tập' },
    { value: 'client_meeting', label: '👥 Gặp khách hàng', description: 'Gặp gỡ khách hàng' },
    { value: 'other', label: '📋 Khác', description: 'Kế hoạch khác' }
  ];

  const priorities = [
    { value: 'high', label: 'Cao', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'medium', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.type || !formData.startDate || !formData.startTime) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!currentUser?.id) {
      alert('Lỗi: Không xác định được người dùng');
      return;
    }

    try {
      // Tạo kế hoạch mới trong personal workspace
      const newPlan = personalPlanService.addPlan(currentUser.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type as any,
        status: 'pending',
        priority: formData.priority as any || 'medium',
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        startTime: formData.startTime,
        endTime: formData.endTime || formData.startTime,
        location: formData.location,
        notes: formData.notes,
        participants: formData.participants,
        creator: currentUser.name
      });

      console.log('✅ Đã tạo kế hoạch cá nhân:', newPlan.title);

      // Reset form và đóng modal
      setFormData({
        title: '',
        description: '',
        type: '',
        priority: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: '',
        notes: '',
        participants: []
      });

      // Callback để refresh data
      if (onPlanCreated) {
        onPlanCreated();
      }

      onClose();
      alert('Tạo kế hoạch thành công!');
    } catch (error) {
      console.error('Lỗi khi tạo kế hoạch:', error);
      alert('Có lỗi xảy ra khi tạo kế hoạch. Vui lòng thử lại.');
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
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 mb-20"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Tạo kế hoạch mới</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về kế hoạch..."
                rows={3}
              />
            </div>

            {/* Loại và Độ ưu tiên */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label className="text-sm font-medium">Độ ưu tiên</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <Badge className={priority.color}>{priority.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ngày và Giờ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label className="text-sm font-medium">Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Giờ bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Giờ kết thúc</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Tạo kế hoạch
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePlanModal;
