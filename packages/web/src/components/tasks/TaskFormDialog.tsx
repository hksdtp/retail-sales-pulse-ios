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
import { useTaskData } from '@/hooks/use-task-data';
import { useToast } from '@/hooks/use-toast';
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
  onTaskCreated?: () => void;
  formType: 'self' | 'team' | 'individual';
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onOpenChange,
  onTaskCreated,
  formType,
}) => {
  const { currentUser, users } = useAuth();
  const { addTask } = useTaskData();
  const { toast } = useToast();
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
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Tạo task mới
      await addTask({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status as any,
        date: formData.date,
        time: formData.time,
        assignedTo: formData.assignedTo,
        isShared: formData.isShared,
        isSharedWithTeam: formData.isSharedWithTeam,
        priority: formData.priority,
      });

      toast({
        title: 'Thành công',
        description: 'Đã tạo công việc mới thành công',
      });

      // Gọi callback để refresh data
      onTaskCreated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo công việc mới',
        variant: 'destructive',
      });
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

        <form onSubmit={handleSubmit} className="space-y-5 mt-4 p-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <label className="text-gray-900 font-medium text-base flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Tiêu đề công việc</span>
            </label>
            <Input
              placeholder="Nhập tiêu đề công việc..."
              className="h-11 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-base font-medium placeholder-gray-400 shadow-sm"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <label className="text-gray-900 font-medium text-base flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Mô tả chi tiết</span>
            </label>
            <Textarea
              placeholder="Mô tả chi tiết về công việc, yêu cầu, mục tiêu..."
              className="min-h-[100px] bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none text-sm text-gray-700 placeholder-gray-400 shadow-sm"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <h3 className="text-gray-900 font-medium text-base">Thông tin công việc</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block">Loại công việc</label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-gray-300 transition-all duration-200 shadow-sm">
                    <SelectValue placeholder="Chọn loại công việc" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
                    <SelectItem value="kts_new" className="py-2.5 px-3 hover:bg-blue-50 border-l-4 border-l-blue-500 text-blue-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>KTS mới</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="kts_old" className="py-2.5 px-3 hover:bg-blue-50 border-l-4 border-l-blue-400 text-blue-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>KTS cũ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="kh_cdt_new" className="py-2.5 px-3 hover:bg-green-50 border-l-4 border-l-green-500 text-green-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>KH/CĐT mới</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="kh_cdt_old" className="py-2.5 px-3 hover:bg-green-50 border-l-4 border-l-green-400 text-green-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>KH/CĐT cũ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sbg_new" className="py-2.5 px-3 hover:bg-purple-50 border-l-4 border-l-purple-500 text-purple-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>SBG mới</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sbg_old" className="py-2.5 px-3 hover:bg-purple-50 border-l-4 border-l-purple-400 text-purple-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>SBG cũ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other" className="py-2.5 px-3 hover:bg-gray-50 border-l-4 border-l-gray-500 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span>Công việc khác</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block">Trạng thái</label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-gray-300 transition-all duration-200 shadow-sm">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
                    <SelectItem value="todo" className="py-3 px-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          Chưa bắt đầu
                        </div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress" className="py-3 px-4 hover:bg-blue-50">
                      <div className="flex items-center space-x-3">
                        <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Đang thực hiện
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </SelectItem>
                    <SelectItem value="completed" className="py-3 px-4 hover:bg-green-50">
                      <div className="flex items-center space-x-3">
                        <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Hoàn thành
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled" className="py-3 px-4 hover:bg-red-50">
                      <div className="flex items-center space-x-3">
                        <div className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Đã hủy
                        </div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block">Mức độ ưu tiên</label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-gray-300 transition-all duration-200 shadow-sm">
                    <SelectValue placeholder="Chọn mức độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
                    <SelectItem value="low" className="py-3 px-4 hover:bg-green-50">
                      <div className="flex items-center space-x-3">
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                          Thấp
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-4 bg-green-400 rounded-sm"></div>
                          <div className="w-1.5 h-4 bg-gray-200 rounded-sm"></div>
                          <div className="w-1.5 h-4 bg-gray-200 rounded-sm"></div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="normal" className="py-3 px-4 hover:bg-yellow-50">
                      <div className="flex items-center space-x-3">
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
                          Bình thường
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-4 bg-yellow-400 rounded-sm"></div>
                          <div className="w-1.5 h-4 bg-yellow-400 rounded-sm"></div>
                          <div className="w-1.5 h-4 bg-gray-200 rounded-sm"></div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="high" className="py-3 px-4 hover:bg-orange-50">
                      <div className="flex items-center space-x-3">
                        <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
                          Cao
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-4 bg-orange-400 rounded-sm"></div>
                          <div className="w-1.5 h-4 bg-orange-400 rounded-sm"></div>
                          <div className="w-1.5 h-4 bg-orange-400 rounded-sm"></div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent" className="py-3 px-4 hover:bg-red-50">
                      <div className="flex items-center space-x-3">
                        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200 animate-pulse">
                          Khẩn cấp
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-4 bg-red-500 rounded-sm animate-pulse"></div>
                          <div className="w-1.5 h-4 bg-red-500 rounded-sm animate-pulse"></div>
                          <div className="w-1.5 h-4 bg-red-500 rounded-sm animate-pulse"></div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-5">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <h3 className="text-gray-900 font-medium text-base">Thời gian & Phân công</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-medium text-sm mb-2 block flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Ngày thực hiện</span>
                </label>
                <Input
                  type="date"
                  className="h-10 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
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
                  className="h-10 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
            </div>

            {(formType === 'team' || formType === 'individual') && canAssignToOthers && (
              <div className="mt-5">
                <label className="text-gray-700 font-medium text-sm mb-2 block flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Giao cho</span>
                </label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
                    <SelectValue placeholder="Chọn người thực hiện" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="py-2 px-3 hover:bg-gray-50">
                        {user.name} - {user.location || 'Chưa xác định'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formType === 'team' && (
              <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="shareWithAll"
                    checked={formData.isShared || false}
                    onChange={(e) => handleInputChange('isShared', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="shareWithAll" className="text-sm font-medium text-gray-700">
                    Chia sẻ với tất cả nhân viên
                  </label>
                </div>
                <div className="flex items-center space-x-3 mt-3">
                  <input
                    type="checkbox"
                    id="shareWithTeam"
                    checked={formData.isSharedWithTeam || false}
                    onChange={(e) => handleInputChange('isSharedWithTeam', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="shareWithTeam" className="text-sm font-medium text-gray-700">
                    Chia sẻ với nhóm của tôi
                  </label>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 p-6 bg-gray-50 -m-6 mt-6 rounded-b-2xl border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-6 rounded-xl border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200 font-medium text-gray-700"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 flex-1"
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
