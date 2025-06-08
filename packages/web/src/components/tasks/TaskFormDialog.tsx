import React, { useState, useEffect } from 'react';
import { Plus, X, Briefcase, FilePen, FileText, Users, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { canAssignTasks } from '@/config/permissions';

interface TaskFormData {
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  date: string;
  time?: string;
  assignedTo?: string;
  isShared?: boolean;
  isSharedWithTeam?: boolean;
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  formType: 'self' | 'team' | 'individual';
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  formType,
}) => {
  const { currentUser, users } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    type: '',
    status: 'todo',
    priority: 'normal',
    date: '',
    time: '',
    assignedTo: currentUser?.id || '',
    isShared: false,
    isSharedWithTeam: false,
  });

  const canAssignToOthers = currentUser && canAssignTasks(currentUser.role);

  const filteredUsers = users.filter((user) => {
    if (formType === 'self') return user.id === currentUser?.id;
    if (formType === 'individual') {
      return currentUser?.team_id === user.team_id;
    }
    return true;
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        type: '',
        status: 'todo',
        priority: 'normal',
        date: '',
        time: '',
        assignedTo: currentUser?.id || '',
        isShared: false,
        isSharedWithTeam: false,
      });
    }
  }, [open, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.type || !formData.date) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] md:max-w-[840px] lg:max-w-[960px] max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-6 border-b border-gray-100/50 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 -m-6 mb-0 p-8 rounded-t-3xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                {formType === 'self' && 'Tạo công việc mới'}
                {formType === 'team' && 'Giao công việc cho Nhóm'}
                {formType === 'individual' && 'Giao công việc cho thành viên'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm font-medium mt-1">
                {formType === 'self' && 'Tạo công việc cá nhân và quản lý tiến độ'}
                {formType === 'team' && 'Phân công công việc cho nhóm hoặc cá nhân bất kỳ'}
                {formType === 'individual' && 'Phân công công việc cho các thành viên trong nhóm'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6 p-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <label className="text-gray-900 font-semibold text-base flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              <span>Tiêu đề công việc</span>
            </label>
            <div className="relative">
              <Input
                placeholder="Nhập tiêu đề công việc..."
                className="h-12 bg-white/80 backdrop-blur-sm border-0 border-b-2 border-gray-200 rounded-none focus:border-blue-500 focus:ring-0 text-lg font-medium placeholder-gray-400 transition-all duration-200"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200 w-0 focus-within:w-full"></div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <label className="text-gray-900 font-semibold text-base flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              <span>Mô tả chi tiết</span>
            </label>
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-xl"></div>
              <Textarea
                placeholder="Mô tả chi tiết về công việc, yêu cầu, mục tiêu..."
                className="min-h-[120px] bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:border-green-500 focus:ring-green-500/20 resize-none pt-4 text-gray-700 placeholder-gray-400"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-gray-900 font-semibold text-base">Thông tin công việc</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block">Loại công việc</label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 hover:border-purple-300 transition-all duration-200">
                    <SelectValue placeholder="Chọn loại công việc" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border border-white/30 shadow-xl rounded-xl overflow-hidden">
                    <SelectItem value="sales">Bán hàng</SelectItem>
                    <SelectItem value="customer_service">Chăm sóc khách hàng</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="admin">Hành chính</SelectItem>
                    <SelectItem value="training">Đào tạo</SelectItem>
                    <SelectItem value="meeting">Họp</SelectItem>
                    <SelectItem value="report">Báo cáo</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block">Trạng thái</label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300 transition-all duration-200">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border border-white/30 shadow-xl rounded-xl overflow-hidden">
                    <SelectItem value="todo">Chưa bắt đầu</SelectItem>
                    <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block">Mức độ ưu tiên</label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:border-red-500 focus:ring-red-500/20 hover:border-red-300 transition-all duration-200">
                    <SelectValue placeholder="Chọn mức độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border border-white/30 shadow-xl rounded-xl overflow-hidden">
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <h3 className="text-gray-900 font-semibold text-base">Thời gian & Phân công</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Ngày thực hiện</span>
                </label>
                <Input
                  type="date"
                  className="h-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Thời gian (tùy chọn)</span>
                </label>
                <Input
                  type="time"
                  className="h-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
            </div>

            {(formType === 'team' || formType === 'individual') && canAssignToOthers && (
              <div className="mt-6">
                <label className="text-gray-700 font-medium text-sm mb-2 block flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Giao cho</span>
                </label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20">
                    <SelectValue placeholder="Chọn người thực hiện" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border border-white/30 shadow-xl rounded-xl overflow-hidden">
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.location || 'Chưa xác định'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formType === 'team' && (
              <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="shareWithAll"
                    checked={formData.isShared || false}
                    onChange={(e) => handleInputChange('isShared', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="shareWithAll" className="text-sm font-medium text-gray-700">
                    Chia sẻ với tất cả nhân viên
                  </label>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="checkbox"
                    id="shareWithTeam"
                    checked={formData.isSharedWithTeam || false}
                    onChange={(e) => handleInputChange('isSharedWithTeam', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="shareWithTeam" className="text-sm font-medium text-gray-700">
                    Chia sẻ với nhóm của tôi
                  </label>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8 p-6 bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur-sm -m-6 mt-8 rounded-b-3xl border-t border-gray-100/50">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-200 font-semibold text-gray-700 transform hover:scale-105"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {formType === 'self'
                      ? 'Tạo công việc'
                      : formType === 'team'
                        ? 'Giao công việc cho Nhóm'
                        : 'Giao công việc cho thành viên'}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
