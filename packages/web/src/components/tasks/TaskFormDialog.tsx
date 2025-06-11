import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Briefcase, FilePen, FileText, Users, Calendar, Clock, AlertCircle, CheckCircle, Zap, ArrowUp, ArrowDown, Minus, AlertTriangle, User, UserCheck, Globe, UserPlus, Search } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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
  visibility: 'personal' | 'team' | 'public';
  sharedWith: string[];
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
    date: new Date().toISOString().split('T')[0], // Default to today
    time: '',
    assignedTo: currentUser?.id || '',
    visibility: 'personal',
    sharedWith: [],
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      const today = new Date();
      setFormData({
        title: '',
        description: '',
        type: '',
        status: 'todo',
        priority: 'normal',
        date: today.toISOString().split('T')[0],
        time: '',
        assignedTo: currentUser?.id || '',
        visibility: 'personal',
        sharedWith: [],
      });
      setSelectedDate(today);
    }
  }, [open, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.type || !formData.date || !formData.visibility) {
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
        visibility: formData.visibility,
        priority: formData.priority,
        sharedWith: formData.sharedWith,
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

  const handleInputChange = (field: keyof TaskFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // User tagging functions
  const addUserToShared = (userId: string) => {
    if (!formData.sharedWith.includes(userId)) {
      handleInputChange('sharedWith', [...formData.sharedWith, userId]);
    }
    setUserSearchQuery('');
    setShowUserDropdown(false);
  };

  const removeUserFromShared = (userId: string) => {
    handleInputChange('sharedWith', formData.sharedWith.filter(id => id !== userId));
  };

  const filteredUsersForTagging = users.filter(user => {
    // Exclude current user
    if (user.id === currentUser?.id) return false;

    // Exclude already selected users
    if (formData.sharedWith.includes(user.id)) return false;

    // Only include users from retail department
    const isRetailUser = user.department_type === 'retail' ||
                        user.department === 'retail' ||
                        user.role?.includes('retail') ||
                        user.location; // Fallback: users with location are likely retail

    if (!isRetailUser) return false;

    // Search filter
    if (userSearchQuery.length === 0) return true;

    const query = userSearchQuery.toLowerCase();
    return user.name.toLowerCase().includes(query) ||
           user.email?.toLowerCase().includes(query) ||
           user.location?.toLowerCase().includes(query);
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
      setIsCalendarOpen(false);
    }
  };

  // Task type configurations with colors and icons
  const taskTypeConfig = {
    architect_new: {
      label: 'KTS mới',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Users,
      gradient: 'from-emerald-50 to-emerald-100'
    },
    architect_old: {
      label: 'KTS cũ',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-150',
      icon: Users,
      gradient: 'from-emerald-25 to-emerald-75'
    },
    client_new: {
      label: 'KH/CĐT mới',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Briefcase,
      gradient: 'from-blue-50 to-blue-100'
    },
    client_old: {
      label: 'KH/CĐT cũ',
      color: 'bg-blue-50 text-blue-700 border-blue-150',
      icon: Briefcase,
      gradient: 'from-blue-25 to-blue-75'
    },
    quote_new: {
      label: 'SBG mới',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: FileText,
      gradient: 'from-purple-50 to-purple-100'
    },
    quote_old: {
      label: 'SBG cũ',
      color: 'bg-purple-50 text-purple-700 border-purple-150',
      icon: FileText,
      gradient: 'from-purple-25 to-purple-75'
    },
    partner_new: {
      label: 'Đối tác mới',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: FilePen,
      gradient: 'from-orange-50 to-orange-100'
    },
    partner_old: {
      label: 'Đối tác cũ',
      color: 'bg-orange-50 text-orange-700 border-orange-150',
      icon: FilePen,
      gradient: 'from-orange-25 to-orange-75'
    },
    other: {
      label: 'Công việc khác',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Clock,
      gradient: 'from-gray-50 to-gray-100'
    }
  };

  // Status configurations
  const statusConfig = {
    todo: {
      label: 'Chưa bắt đầu',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Clock,
      dotColor: 'bg-gray-400'
    },
    'in-progress': {
      label: 'Đang thực hiện',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Zap,
      dotColor: 'bg-blue-500'
    },
    'on-hold': {
      label: 'Tạm hoãn',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertCircle,
      dotColor: 'bg-yellow-500'
    },
    completed: {
      label: 'Hoàn thành',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      dotColor: 'bg-green-500'
    }
  };

  // Priority configurations
  const priorityConfig = {
    low: {
      label: 'Thấp',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: ArrowDown,
      dotColor: 'bg-green-500'
    },
    normal: {
      label: 'Bình thường',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Minus,
      dotColor: 'bg-blue-500'
    },
    high: {
      label: 'Cao',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: ArrowUp,
      dotColor: 'bg-orange-500'
    },
    urgent: {
      label: 'Khẩn cấp',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertTriangle,
      dotColor: 'bg-red-500'
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="task-form-dialog w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white shadow-2xl border-0 rounded-3xl animate-in fade-in-0 zoom-in-95 duration-300"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          zIndex: 10000,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        <DialogHeader className="pb-6 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 -mx-6 -mt-6 px-6 pt-6 rounded-t-3xl">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-105">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl">
                {formType === 'self' && 'Tạo công việc mới'}
                {formType === 'team' && 'Giao công việc cho Nhóm'}
                {formType === 'individual' && 'Giao công việc cho thành viên'}
              </span>
              <DialogDescription className="text-gray-600 text-sm font-normal mt-1">
                {formType === 'self' && 'Tạo công việc cá nhân và quản lý tiến độ hiệu quả'}
                {formType === 'team' && 'Phân công công việc cho nhóm hoặc cá nhân bất kỳ trong tổ chức'}
                {formType === 'individual' && 'Phân công công việc cho các thành viên trong nhóm của bạn'}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 px-6 -mx-6 max-h-[60vh] overflow-y-auto custom-scrollbar" style={{ position: 'relative' }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
            {/* Tiêu đề */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Tiêu đề công việc <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="title"
                placeholder="Nhập tiêu đề công việc..."
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
                placeholder="Mô tả chi tiết về công việc, yêu cầu, mục tiêu..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full min-h-[120px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl resize-none transition-all duration-200 hover:bg-white hover:shadow-sm"
                required
              />
            </div>

            {/* Loại công việc - Pill Layout */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Loại công việc <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(taskTypeConfig).map(([key, config]) => {
                  const IconComponent = config.icon;
                  const isSelected = formData.type === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleInputChange('type', key)}
                      className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'border-gray-200 bg-white/80 text-gray-700 hover:border-gray-300 hover:bg-white hover:shadow-sm'
                        }
                      `}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium whitespace-nowrap">
                        {config.label}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trạng thái và Ưu tiên */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Trạng thái
                </label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="w-full h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm">
                    <SelectValue placeholder="Chọn trạng thái">
                      {formData.status && (
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${statusConfig[formData.status as keyof typeof statusConfig]?.dotColor}`}></div>
                          <span className="font-medium">{statusConfig[formData.status as keyof typeof statusConfig]?.label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95 duration-200">
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <SelectItem
                          key={key}
                          value={key}
                          className="rounded-xl mb-1 hover:bg-gray-50 transition-all duration-150 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 py-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} transition-all duration-200 group-hover:scale-105`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800">{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Mức độ ưu tiên
                </label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="w-full h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm">
                    <SelectValue placeholder="Chọn mức độ ưu tiên">
                      {formData.priority && (
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${priorityConfig[formData.priority as keyof typeof priorityConfig]?.dotColor}`}></div>
                          <span className="font-medium">{priorityConfig[formData.priority as keyof typeof priorityConfig]?.label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95 duration-200">
                    {Object.entries(priorityConfig).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <SelectItem
                          key={key}
                          value={key}
                          className="rounded-xl mb-1 hover:bg-gray-50 transition-all duration-150 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 py-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} transition-all duration-200 group-hover:scale-105`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800">{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Ngày thực hiện <span className="text-red-500 ml-1">*</span>
                </label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm justify-start text-left font-normal"
                    >
                      <Calendar className="mr-3 h-4 w-4 text-gray-500" />
                      {selectedDate ? (
                        <span className="font-medium text-gray-900">
                          {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: vi })}
                        </span>
                      ) : (
                        <span className="text-gray-500">Chọn ngày thực hiện</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
                    align="start"
                  >
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="rounded-2xl"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-semibold text-gray-900",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all duration-150",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 rounded-lg transition-all duration-150",
                        day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                        day_today: "bg-gray-100 text-gray-900 font-semibold",
                        day_outside: "text-gray-400 opacity-50",
                        day_disabled: "text-gray-400 opacity-50",
                        day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Thời gian (tùy chọn)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full h-12 pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Phân công */}
            {(formType === 'team' || formType === 'individual') && canAssignToOthers && (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Giao cho
                </label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger className="w-full h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm">
                    <SelectValue placeholder="Chọn người thực hiện" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95 duration-200">
                    {filteredUsers.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        className="rounded-xl mb-1 hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.location || 'Chưa xác định'}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Phạm vi chia sẻ công việc */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Phạm vi chia sẻ <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('visibility', 'personal')}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${formData.visibility === 'personal'
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white/80 text-gray-700 hover:border-gray-300 hover:bg-white hover:shadow-sm'
                    }
                  `}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Cá nhân</span>
                  {formData.visibility === 'personal' && <CheckCircle className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('visibility', 'team')}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${formData.visibility === 'team'
                      ? 'border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'border-gray-200 bg-white/80 text-gray-700 hover:border-gray-300 hover:bg-white hover:shadow-sm'
                    }
                  `}
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Nhóm</span>
                  {formData.visibility === 'team' && <CheckCircle className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('visibility', 'public')}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${formData.visibility === 'public'
                      ? 'border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'border-gray-200 bg-white/80 text-gray-700 hover:border-gray-300 hover:bg-white hover:shadow-sm'
                    }
                  `}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Chung</span>
                  {formData.visibility === 'public' && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Chia sẻ với người cụ thể */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Chia sẻ với người cụ thể (tùy chọn)
              </label>

              {/* Selected users */}
              {formData.sharedWith.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.sharedWith.map(userId => {
                    const user = users.find(u => u.id === userId);
                    if (!user) return null;
                    return (
                      <div
                        key={userId}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200"
                      >
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{user.name}</span>
                        <button
                          type="button"
                          onClick={() => removeUserFromShared(userId)}
                          className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors duration-150"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* User search input */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Tìm kiếm và thêm người..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setUserSearchQuery(query);
                      const shouldShow = query.length > 0 && filteredUsersForTagging.length > 0;
                      setShowUserDropdown(shouldShow);
                      console.log('🔍 Search query:', query, 'shouldShow:', shouldShow, 'filteredUsers:', filteredUsersForTagging.length);
                    }}
                    onFocus={() => {
                      const shouldShow = userSearchQuery.length > 0 && filteredUsersForTagging.length > 0;
                      setShowUserDropdown(shouldShow);
                      console.log('🎯 Focus - shouldShow:', shouldShow, 'query:', userSearchQuery, 'users:', filteredUsersForTagging.length);
                    }}
                    onBlur={() => {
                      // Delay hiding to allow click on dropdown items
                      setTimeout(() => setShowUserDropdown(false), 150);
                    }}
                    className="w-full h-10 pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm"
                  />
                </div>

                {/* User dropdown - Simplified positioning */}
                {showUserDropdown && filteredUsersForTagging.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                    style={{
                      zIndex: 99999,
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      backdropFilter: 'blur(8px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.98)'
                    }}
                  >
                    {filteredUsersForTagging.slice(0, 5).map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addUserToShared(user.id)}
                        onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email || user.location}</div>
                          </div>
                          <UserPlus className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 -mx-6 -mb-6 px-6 pb-6 rounded-b-3xl flex flex-row justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-8 py-3 h-12 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 hover:shadow-sm rounded-xl font-medium transition-all duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.type || !formData.date || !formData.visibility}
            className="px-8 py-3 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-3" />
                <span>
                  {formType === 'self'
                    ? 'Tạo công việc'
                    : formType === 'team'
                      ? 'Giao công việc cho Nhóm'
                      : 'Giao công việc cho thành viên'}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
