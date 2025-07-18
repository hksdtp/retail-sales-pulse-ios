import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Briefcase, FilePen, FileText, Users, Calendar, Clock, AlertCircle, CheckCircle, Zap, ArrowUp, ArrowDown, Minus, AlertTriangle, User, UserCheck, Globe, UserPlus, Search, Building, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnimatedModal } from '@/components/ui/animated-dialog';
import { AnimatedButton } from '@/components/ui/animated-button';
import ImageUpload from '@/components/ui/ImageUpload';
import TaskTypeSelector, { taskTypeConfig } from '@/components/ui/TaskTypeSelector';
import DateTimePicker from '@/components/ui/DateTimePicker';
import MultiUserPicker from '@/components/ui/MultiUserPicker';
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
import { useAuth } from '@/context/AuthContextSupabase';
import { useTaskData } from '@/hooks/use-task-data';
import { useToast } from '@/hooks/use-toast';
import { UploadedImage } from '@/services/ImageUploadService';

import { canAssignTasks } from '@/config/permissions';
import { cn } from '@/lib/utils';
import '@/styles/task-form-dark-theme.css';

interface TaskFormData {
  title: string;
  description: string;
  type: string;
  types: string[]; // Multiple types support
  status: string;
  priority: string;
  date: string;
  deadline: string;
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
  const { currentUser, users, isAuthenticated, isLoading } = useAuth();
  const { addTask } = useTaskData();
  const { toast } = useToast();

  // DEBUG: Log auth state when component mounts or currentUser changes
  React.useEffect(() => {
    console.log('🔍 [TaskFormDialog] Auth state:', {
      currentUser,
      hasCurrentUser: !!currentUser,
      isAuthenticated,
      isLoading,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name,
      usersCount: users?.length || 0
    });
  }, [currentUser, isAuthenticated, isLoading, users]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDeadline, setSelectedDeadline] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    type: '',
    types: [], // Multiple types
    status: 'todo',
    priority: 'normal',
    date: new Date().toISOString().split('T')[0], // Always default to today
    deadline: '', // No default deadline - optional
    time: '', // Remove time field
    assignedTo: currentUser?.id || '',
    visibility: 'personal',
    sharedWith: [],
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

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
      setSelectedDate(today);
      setSelectedDeadline(null); // No default deadline
      setFormData({
        title: '',
        description: '',
        type: '',
        types: [],
        status: 'todo',
        priority: 'normal',
        date: today.toISOString().split('T')[0], // Always today
        deadline: '', // No default deadline
        time: '', // Remove time
        assignedTo: currentUser?.id || '',
        visibility: 'personal',
        sharedWith: [],
      });
      setUploadedImages([]);
    }
  }, [open, currentUser]);

  // Map UI task types to database-allowed types
  const mapTaskTypeToDatabase = (uiType: string): string => {
    const typeMapping: Record<string, string> = {
      // Work-related types
      'sbg-new': 'work',
      'sbg-old': 'work',
      'partner-new': 'work',
      'partner-old': 'work',
      'customer-new': 'work',
      'customer-old': 'work',
      'project-new': 'work',
      'project-old': 'work',
      'maintenance': 'work',
      'installation': 'work',
      'repair': 'work',
      'inspection': 'work',
      'training': 'work',
      'sales': 'work',
      'marketing': 'work',
      'support': 'work',

      // Meeting types
      'meeting': 'meeting',
      'conference': 'meeting',
      'presentation': 'meeting',
      'review': 'meeting',

      // Personal types
      'personal': 'personal',
      'leave': 'personal',
      'vacation': 'personal',

      // Default fallback
      'other': 'other',
      'misc': 'other',
      'general': 'other'
    };

    return typeMapping[uiType] || 'other'; // Default to 'other' if not found
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // DEBUG: Log current user state
    console.log('🔍 [TaskFormDialog] Debug currentUser:', {
      currentUser,
      hasCurrentUser: !!currentUser,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name,
      authContextType: 'AuthContextSupabase'
    });

    // CRITICAL: Validate user authentication first
    if (!currentUser) {
      console.error('❌ [TaskFormDialog] currentUser is null/undefined');

      // TEMPORARY WORKAROUND: Try to get user from localStorage or use fallback
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Continue with stored user data
          const fallbackUser = {
            id: parsedUser.id,
            name: parsedUser.name,
            team_id: parsedUser.team_id,
            location: parsedUser.location
          };

          // Proceed with task creation using fallback user
          await createTaskWithUser(fallbackUser);
          return;
        } catch (error) {
          console.error('❌ Failed to parse stored user:', error);
        }
      }

      toast({
        title: 'Lỗi xác thực',
        description: 'Bạn cần đăng nhập để tạo công việc mới. Vui lòng đăng nhập lại.',
        variant: 'destructive',
      });
      return;
    }

    // CRITICAL: Validate user information completeness
    if (!currentUser.id || !currentUser.name) {
      console.error('❌ [TaskFormDialog] currentUser missing required fields:', {
        hasId: !!currentUser.id,
        hasName: !!currentUser.name,
        currentUser
      });
      toast({
        title: 'Lỗi thông tin người dùng',
        description: 'Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.',
        variant: 'destructive',
      });
      return;
    }

    // Proceed with normal task creation
    await createTaskWithUser(currentUser);
  };

  // Helper function to create task with user data
  const createTaskWithUser = async (user: any) => {
    if (!formData.title.trim() || !formData.description.trim() || formData.types.length === 0 || !formData.date || !formData.visibility) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc (ít nhất 1 loại công việc)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('🎯 Creating task for user:', {
        id: user.id,
        name: user.name,
        team_id: user.team_id,
        location: user.location
      });

      // Map UI type to database type
      const databaseType = mapTaskTypeToDatabase(formData.type);

      // Tạo task mới
      await addTask({
        title: formData.title,
        description: `${formData.description}\n\n📋 Loại công việc: ${formData.types.map(type => taskTypeConfig[type as keyof typeof taskTypeConfig]?.label).join(', ')}${formData.deadline ? `\n⏰ Hạn chót: ${formData.deadline}` : ''}${uploadedImages.length > 0 ? `\n📷 Có ${uploadedImages.length} hình ảnh đính kèm` : ''}`,
        type: databaseType, // Use mapped database type
        types: formData.types, // Send multiple types
        status: formData.status as any,
        date: formData.date,
        deadline: formData.deadline,
        time: formData.time,
        assignedTo: formData.assignedTo,
        visibility: formData.visibility,
        priority: formData.priority,
        sharedWith: formData.sharedWith,
        images: uploadedImages, // Include uploaded images
        // CRITICAL: Add user info for proper ownership and filtering
        user_id: user.id,
        user_name: user.name,
        team_id: user.team_id,
        location: user.location,
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

  // Function to auto-tag title with task type
  const updateTitleWithTypeTag = (types: string[], currentTitle: string) => {
    if (types.length === 0) return currentTitle;

    const primaryType = types[0];
    const typeConfig = taskTypeConfig[primaryType];
    if (!typeConfig) return currentTitle;

    const typeLabel = typeConfig.label;

    // Remove existing type tags from title
    let cleanTitle = currentTitle;
    Object.values(taskTypeConfig).forEach(config => {
      const tagPattern = new RegExp(`^${config.label}\\s*:\\s*`, 'i');
      cleanTitle = cleanTitle.replace(tagPattern, '');
    });

    // Add new type tag if title doesn't already start with it
    const newTitle = cleanTitle.trim() ? `${typeLabel}: ${cleanTitle.trim()}` : `${typeLabel}: `;

    return newTitle;
  };

  // Handle multiple type selection
  const handleTypeToggle = (typeKey: string) => {
    setFormData(prev => {
      const newTypes = prev.types.includes(typeKey)
        ? prev.types.filter(t => t !== typeKey)
        : [...prev.types, typeKey];

      // Update primary type to first selected type
      const primaryType = newTypes.length > 0 ? newTypes[0] : '';

      // Auto-tag title with type
      const updatedTitle = updateTitleWithTypeTag(newTypes, prev.title);

      return {
        ...prev,
        types: newTypes,
        type: primaryType,
        title: updatedTitle
      };
    });
  };

  // Task type configurations with colors and icons
  const taskTypeConfig = {
    other: {
      label: 'Công việc khác',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Briefcase,
      gradient: 'from-gray-50 to-gray-100'
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
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: FilePen,
      gradient: 'from-orange-50 to-orange-100'
    },
    architect_new: {
      label: 'KTS mới',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Building,
      gradient: 'from-blue-50 to-blue-100'
    },
    architect_old: {
      label: 'KTS cũ',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Building,
      gradient: 'from-blue-50 to-blue-100'
    },
    client_new: {
      label: 'Khách hàng mới',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Users,
      gradient: 'from-green-50 to-green-100'
    },
    client_old: {
      label: 'Khách hàng cũ',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Users,
      gradient: 'from-green-50 to-green-100'
    },

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
        className="task-form-dialog w-[95vw] max-w-none sm:w-[90vw] lg:w-[85vw] xl:w-[80vw] max-h-[95vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 shadow-2xl border-0 rounded-2xl sm:rounded-3xl animate-in fade-in-0 zoom-in-95 duration-300"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          zIndex: 10000,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
        data-theme-aware="true"
      >
        <DialogHeader className="flex-shrink-0 pb-2 sm:pb-3 border-b border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700/50 -mx-2 sm:-mx-4 -mt-2 sm:-mt-4 px-2 sm:px-4 pt-2 sm:pt-3 rounded-t-2xl sm:rounded-t-3xl">
          <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-105">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base">
                {formType === 'self' && 'Tạo công việc mới'}
                {formType === 'team' && 'Giao công việc cho Nhóm'}
                {formType === 'individual' && 'Giao công việc cho thành viên'}
              </span>
              <DialogDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-normal mt-1 hidden sm:block">
                {formType === 'self' && 'Tạo công việc cá nhân và quản lý tiến độ hiệu quả'}
                {formType === 'team' && 'Phân công công việc cho nhóm hoặc cá nhân bất kỳ trong tổ chức'}
                {formType === 'individual' && 'Phân công công việc cho các thành viên trong nhóm của bạn'}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 py-2 sm:py-4 px-2 sm:px-4 -mx-2 sm:-mx-4 overflow-y-auto thin-scrollbar" style={{ position: 'relative' }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 sm:space-y-5">
            {/* Loại công việc - Moved to top */}
            <div className="group">
              <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                Loại công việc <span className="text-red-500 ml-1">*</span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">(Có thể chọn nhiều)</span>
              </label>
              <TaskTypeSelector
                selectedTypes={formData.types}
                onTypesChange={(types) => {
                  setFormData(prev => ({
                    ...prev,
                    types,
                    type: types.length > 0 ? types[0] : ''
                  }));
                }}
                layout="pills"
                maxSelection={3}
                className="w-full"
              />
            </div>

            {/* Tiêu đề - Simple Input without Smart Suggestions */}
            <div className="group">
              <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                Tiêu đề công việc <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                id="task-title"
                name="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nhập tiêu đề công việc..."
                className="w-full text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                required
              />
            </div>

            {/* Mô tả - Full width */}
            <div className="group">
              <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                Mô tả chi tiết <span className="text-red-500 ml-1">*</span>
              </label>
              <Textarea
                id="task-description"
                name="description"
                placeholder="Mô tả chi tiết về công việc, yêu cầu, mục tiêu..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full min-h-[80px] sm:min-h-[100px] text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg sm:rounded-xl resize-none transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                required
              />
            </div>

            {/* Trạng thái và Ưu tiên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="group">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                  Trạng thái
                </label>
                <Select name="status" value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger id="task-status" className="w-full h-10 sm:h-12 text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                    <SelectValue placeholder="Chọn trạng thái">
                      {formData.status && (
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${statusConfig[formData.status as keyof typeof statusConfig]?.dotColor}`}></div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{statusConfig[formData.status as keyof typeof statusConfig]?.label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95 duration-200">
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <SelectItem
                          key={key}
                          value={key}
                          className="rounded-xl mb-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 py-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} transition-all duration-200 group-hover:scale-105`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="group">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                  Mức độ ưu tiên
                </label>
                <Select name="priority" value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger id="task-priority" className="w-full h-10 sm:h-12 text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                    <SelectValue placeholder="Chọn mức độ ưu tiên">
                      {formData.priority && (
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${priorityConfig[formData.priority as keyof typeof priorityConfig]?.dotColor}`}></div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{priorityConfig[formData.priority as keyof typeof priorityConfig]?.label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95 duration-200">
                    {Object.entries(priorityConfig).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <SelectItem
                          key={key}
                          value={key}
                          className="rounded-xl mb-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 py-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} transition-all duration-200 group-hover:scale-105`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ngày thực hiện - Always default to today */}
            <div className="group">
              <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                Ngày thực hiện <span className="text-red-500 ml-1">*</span>
              </label>
              <DateTimePicker
                id="task-date"
                name="date"
                date={selectedDate}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  if (date) {
                    setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
                  }
                }}
                label=""
                placeholder="Chọn ngày thực hiện"
                required={true}
                showTime={false}
                minDate={new Date()}
                className="w-full"
              />
            </div>

            {/* Hạn chót - Optional with button */}
            <div className="group">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                  Hạn chót
                </label>
                {!selectedDeadline && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const defaultDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                      setSelectedDeadline(defaultDeadline);
                      setFormData(prev => ({ ...prev, deadline: defaultDeadline.toISOString().split('T')[0] }));
                    }}
                    className="text-xs px-3 py-1 h-7 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                  >
                    + Thêm hạn chót
                  </Button>
                )}
              </div>
              {selectedDeadline && (
                <div className="relative">
                  <DateTimePicker
                    id="task-deadline"
                    name="deadline"
                    date={selectedDeadline}
                    onDateChange={(date) => {
                      setSelectedDeadline(date);
                      if (date) {
                        setFormData(prev => ({ ...prev, deadline: date.toISOString().split('T')[0] }));
                      }
                    }}
                    label=""
                    placeholder="Chọn hạn chót"
                    required={false}
                    showTime={false}
                    minDate={selectedDate || new Date()}
                    className="w-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDeadline(null);
                      setFormData(prev => ({ ...prev, deadline: '' }));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Assignment và Visibility - Responsive grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Phân công - Multi-select */}
              {(formType === 'team' || formType === 'individual') && canAssignToOthers && (
                <div className="group">
                  <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                    Giao cho ai <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">
                      (Có thể chọn nhiều người)
                    </span>
                  </label>
                  <MultiUserPicker
                    users={filteredUsers.map(user => ({
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      role: user.role,
                      isOnline: true // You can add online status logic here
                    }))}
                    selectedUserIds={formData.sharedWith}
                    onSelectionChange={(userIds) => {
                      handleInputChange('sharedWith', userIds);
                      // Set primary assignee to first selected user
                      if (userIds.length > 0) {
                        handleInputChange('assignedTo', userIds[0]);
                      }
                    }}
                    placeholder="Chọn người được giao việc..."
                    maxSelection={5}
                    showRoles={true}
                    currentUserId={currentUser?.id}
                    className="w-full"
                  />
                </div>
              )}

              {/* Phạm vi chia sẻ công việc */}
              <div className="group sm:col-span-2">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                  Phạm vi chia sẻ <span className="text-red-500 ml-1">*</span>
                </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('visibility', 'personal')}
                  className={`
                    inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${formData.visibility === 'personal'
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                    }
                  `}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">Cá nhân</span>
                  {formData.visibility === 'personal' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('visibility', 'team')}
                  className={`
                    inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${formData.visibility === 'team'
                      ? 'border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                    }
                  `}
                >
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">Nhóm</span>
                  {formData.visibility === 'team' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('visibility', 'public')}
                  className={`
                    inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${formData.visibility === 'public'
                      ? 'border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                    }
                  `}
                >
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">Chung</span>
                  {formData.visibility === 'public' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              </div>
            </div>

            {/* Hình ảnh đính kèm - Cloudinary */}
            <div className="group">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Hình ảnh đính kèm (tùy chọn)
                </label>
              </div>

              <ImageUpload
                onImagesUploaded={setUploadedImages}
                maxImages={5}
                existingImages={uploadedImages}
              />
            </div>
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 sm:pt-6 border-t border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-700/50 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 pb-4 sm:pb-6 rounded-b-2xl sm:rounded-b-3xl flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6 sm:px-8 py-2.5 sm:py-3 h-10 sm:h-12 text-sm sm:text-base border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm rounded-lg sm:rounded-xl font-medium transition-all duration-200 order-2 sm:order-1"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || formData.types.length === 0 || !formData.date || !formData.visibility}
            className="px-6 sm:px-8 py-2.5 sm:py-3 h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                <span>
                  {formData.visibility === 'personal'
                    ? 'Lưu Công Việc'
                    : 'Giao việc cho thành viên'}
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
