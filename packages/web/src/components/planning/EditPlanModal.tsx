import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, FileText, AlertCircle } from 'lucide-react';
import { PersonalPlan } from '@/services/PersonalPlanService';
import { personalPlanService } from '@/services/PersonalPlanService';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PersonalPlan | null;
  currentUser: any;
  onPlanUpdated?: () => void;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  plan, 
  currentUser, 
  onPlanUpdated 
}) => {
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

  // Load plan data when modal opens
  useEffect(() => {
    if (isOpen && plan) {
      setFormData({
        title: plan.title || '',
        description: plan.description || '',
        type: plan.type || '',
        priority: plan.priority || '',
        startDate: plan.startDate || '',
        endDate: plan.endDate || '',
        startTime: plan.startTime || '',
        endTime: plan.endTime || '',
        location: plan.location || '',
        notes: plan.notes || '',
        participants: plan.participants || []
      });
    }
  }, [isOpen, plan]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!plan || !currentUser?.id) {
      alert('Lỗi: Không xác định được kế hoạch hoặc người dùng');
      return;
    }

    // Validation
    if (!formData.title || !formData.type || !formData.startDate || !formData.startTime) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      // Cập nhật kế hoạch
      const updatedPlan = personalPlanService.updatePlan(currentUser.id, plan.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type as any,
        priority: formData.priority as any || 'normal',
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        startTime: formData.startTime,
        endTime: formData.endTime || formData.startTime,
        location: formData.location,
        notes: formData.notes,
        participants: formData.participants
      });

      if (updatedPlan) {
        console.log('✅ Đã cập nhật kế hoạch:', updatedPlan.title);
        
        // Callback để refresh data
        if (onPlanUpdated) {
          onPlanUpdated();
        }

        // Force refresh calendar plans
        if ((window as any).refreshCalendarPlans) {
          (window as any).refreshCalendarPlans();
        }

        // Force refresh plan list if exists
        if ((window as any).refreshPlanList) {
          (window as any).refreshPlanList();
        }

        onClose();
        alert('Đã cập nhật kế hoạch thành công!');
      } else {
        alert('Lỗi: Không thể cập nhật kế hoạch');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật kế hoạch:', error);
      alert('Có lỗi xảy ra khi cập nhật kế hoạch');
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa kế hoạch</h2>
              <p className="text-sm text-gray-500">Cập nhật thông tin kế hoạch của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập tiêu đề kế hoạch..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại kế hoạch <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Chọn loại kế hoạch</option>
                <option value="meeting">🤝 Họp/Gặp gỡ</option>
                <option value="task">📋 Công việc</option>
                <option value="event">🎉 Sự kiện</option>
                <option value="training">📚 Đào tạo</option>
                <option value="travel">✈️ Công tác</option>
                <option value="personal">👤 Cá nhân</option>
                <option value="other">📝 Khác</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Mô tả chi tiết về kế hoạch..."
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày kết thúc
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ kết thúc
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Priority & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Mức độ ưu tiên
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="low">🟢 Thấp</option>
                <option value="normal">🟡 Bình thường</option>
                <option value="high">🟠 Cao</option>
                <option value="urgent">🔴 Khẩn cấp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Địa điểm
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập địa điểm..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Cập nhật kế hoạch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlanModal;
