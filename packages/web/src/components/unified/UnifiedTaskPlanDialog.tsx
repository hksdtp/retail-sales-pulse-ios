import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContextSupabase';
import { useTaskData } from '@/context/TaskDataContext';
import { useToast } from '@/hooks/use-toast';
import { PlanService } from '@/services/PlanService';
import { PlanFormData } from '@/types/plan';
import TaskTypeSelector, { taskTypeConfig } from '@/components/ui/TaskTypeSelector';
import DateTimePicker from '@/components/ui/DateTimePicker';
import {
  Plus,
  X,
  Calendar,
  Clock,
  Briefcase,
  Target,
  Repeat,
  Bell,
  Users,
  Tag,
  ArrowDown,
  ArrowUp,
  Minus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedTaskPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
  onPlanCreated?: () => void;
  initialMode?: 'task' | 'plan';
  sourceTask?: any; // For task-to-plan conversion
  sourcePlan?: any; // For plan-to-task conversion
  formType?: 'self' | 'team' | 'individual';
}

type FormMode = 'task' | 'plan';

interface UnifiedFormData {
  // Common fields
  title: string;
  description: string;
  types: string[]; // Multiple types like TaskFormDialog
  type: string; // Primary type
  priority: 'low' | 'normal' | 'high' | 'urgent';
  date: string;
  time: string;
  deadline?: string;
  assignedTo: string;
  visibility: 'personal' | 'team' | 'public';
  sharedWith: string[];

  // Task-specific fields
  status: 'todo' | 'in-progress' | 'on-hold' | 'completed';

  // Plan-specific fields
  reminder_date?: string;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval: number;
  recurrence_end_date?: string;
  auto_create_task: boolean;
  notes: string;
}

const UnifiedTaskPlanDialog: React.FC<UnifiedTaskPlanDialogProps> = ({
  open,
  onOpenChange,
  onTaskCreated,
  onPlanCreated,
  initialMode = 'task',
  sourceTask,
  sourcePlan,
  formType = 'self'
}) => {
  const { currentUser } = useAuth();
  const { addTask } = useTaskData();
  const { toast } = useToast();
  const [planService] = useState(() => new PlanService());

  const [mode, setMode] = useState<FormMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [formData, setFormData] = useState<UnifiedFormData>({
    title: '',
    description: '',
    types: [],
    type: '',
    priority: 'normal',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    assignedTo: '',
    visibility: 'personal',
    sharedWith: [],
    status: 'todo',
    is_recurring: false,
    recurrence_interval: 1,
    auto_create_task: true,
    notes: ''
  });

  // Use imported taskTypeConfig from TaskTypeSelector

  // Status configurations - Same as TaskFormDialog
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

  // Priority configurations - Same as TaskFormDialog
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

  // Initialize form data from source task/plan
  useEffect(() => {
    if (sourceTask && mode === 'plan') {
      setFormData(prev => ({
        ...prev,
        title: sourceTask.title,
        description: sourceTask.description,
        types: sourceTask.types || [sourceTask.type],
        type: sourceTask.type,
        priority: sourceTask.priority || 'normal',
        assignedTo: sourceTask.assignedTo || '',
        visibility: sourceTask.visibility || 'personal',
        sharedWith: sourceTask.sharedWith || [],
        notes: `Được tạo từ công việc: ${sourceTask.title}`
      }));
    }

    if (sourcePlan && mode === 'task') {
      setFormData(prev => ({
        ...prev,
        title: sourcePlan.title,
        description: sourcePlan.description,
        types: [sourcePlan.type],
        type: sourcePlan.type,
        priority: sourcePlan.priority,
        date: sourcePlan.scheduled_date,
        time: sourcePlan.scheduled_time || '09:00',
        assignedTo: sourcePlan.assigned_to || '',
        visibility: sourcePlan.visibility,
        sharedWith: sourcePlan.shared_with || []
      }));
    }
  }, [sourceTask, sourcePlan, mode]);

  // Helper functions - Same as TaskFormDialog
  const handleInputChange = (field: keyof UnifiedFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to auto-tag title with task type - Same as TaskFormDialog
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

  // Handle multiple type selection - Same as TaskFormDialog
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

  const handleModeSwitch = (newMode: FormMode) => {
    setMode(newMode);
    // No need to sync fields since we use the same date/time fields
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CRITICAL: Validate user authentication first
    if (!currentUser) {
      toast({
        title: 'Lỗi xác thực',
        description: 'Bạn cần đăng nhập để tạo công việc/kế hoạch mới. Vui lòng đăng nhập lại.',
        variant: 'destructive',
      });
      return;
    }

    // CRITICAL: Validate user information completeness
    if (!currentUser.id || !currentUser.name) {
      toast({
        title: 'Lỗi thông tin người dùng',
        description: 'Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields - Same as TaskFormDialog
    if (!formData.title.trim() || !formData.description.trim() || formData.types.length === 0 || !formData.date || !formData.visibility) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc (ít nhất 1 loại công việc)',
        variant: 'destructive',
      });
      return;
    }

    console.log('🎯 Creating', mode, 'for user:', {
      id: currentUser.id,
      name: currentUser.name,
      team_id: currentUser.team_id,
      location: currentUser.location
    });

    setIsSubmitting(true);

    try {
      if (mode === 'task') {
        await handleTaskSubmission();
      } else {
        await handlePlanSubmission();
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Lỗi',
        description: `Không thể tạo ${mode === 'task' ? 'công việc' : 'kế hoạch'} mới.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskSubmission = async () => {
    // Create task data exactly like TaskFormDialog
    const taskData = {
      title: formData.title,
      description: `${formData.description}\n\n📋 Loại công việc: ${formData.types.map(type => taskTypeConfig[type as keyof typeof taskTypeConfig]?.label).join(', ')}${formData.deadline ? `\n⏰ Hạn chót: ${formData.deadline}` : ''}`,
      type: formData.types[0] || 'other',
      status: formData.status,
      date: formData.date,
      time: formData.time,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      visibility: formData.visibility,
      sharedWith: formData.sharedWith,
      types: formData.types,
      deadline: formData.deadline,
      // CRITICAL: Add user info for proper ownership and filtering
      user_id: currentUser.id,
      user_name: currentUser.name,
      team_id: currentUser.team_id,
      location: currentUser.location,
      progress: 0,
      isNew: true,
      plan_id: sourcePlan?.id,
      is_from_plan: !!sourcePlan,
      auto_created: false
    };

    await addTask(taskData);
    onTaskCreated?.();

    toast({
      title: 'Thành công',
      description: 'Công việc đã được tạo thành công.',
    });
  };

  const handlePlanSubmission = async () => {
    const planData: PlanFormData = {
      title: formData.title,
      description: `${formData.description}\n\n📋 Loại kế hoạch: ${formData.types.map(type => taskTypeConfig[type as keyof typeof taskTypeConfig]?.label).join(', ')}${formData.deadline ? `\n⏰ Hạn chót: ${formData.deadline}` : ''}${formData.notes ? `\n📝 Ghi chú: ${formData.notes}` : ''}`,
      type: formData.types[0] || 'other',
      priority: formData.priority,
      scheduled_date: formData.date, // Use same date field
      scheduled_time: formData.time, // Use same time field
      reminder_date: formData.reminder_date,
      is_recurring: formData.is_recurring,
      recurrence_pattern: formData.recurrence_pattern,
      recurrence_interval: formData.recurrence_interval,
      recurrence_end_date: formData.recurrence_end_date,
      auto_create_task: formData.auto_create_task,
      is_template: false, // Remove is_template from form
      assigned_to: formData.assignedTo,
      visibility: formData.visibility,
      shared_with: formData.sharedWith,
      tags: formData.types, // Use types as tags
      notes: formData.notes
    };

    await planService.createPlan(planData, currentUser.id, currentUser.name);
    onPlanCreated?.();

    toast({
      title: 'Thành công',
      description: 'Kế hoạch đã được tạo thành công.',
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      types: [],
      type: '',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      deadline: '',
      assignedTo: '',
      visibility: 'personal',
      sharedWith: [],
      status: 'todo',
      is_recurring: false,
      recurrence_interval: 1,
      auto_create_task: true,
      notes: ''
    });

    // Reset date pickers
    setSelectedDate(new Date());
    setSelectedDeadline(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl p-0">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-6 z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
              {mode === 'task' ? 'Tạo công việc mới' : 'Tạo kế hoạch mới'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
              {mode === 'task'
                ? 'Điền thông tin chi tiết để tạo công việc mới cho nhóm'
                : 'Lên lịch cho công việc trong tương lai'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Mode Toggle - Same styling as TaskFormDialog tabs */}
          <div className="flex mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleModeSwitch('task')}
              className={cn(
                'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                mode === 'task'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Công việc
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('plan')}
              className={cn(
                'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                mode === 'plan'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Kế hoạch
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Title Section - Same as TaskFormDialog */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Tiêu đề {mode === 'task' ? 'công việc' : 'kế hoạch'} *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={mode === 'task' ? 'Nhập tiêu đề công việc...' : 'Nhập tiêu đề kế hoạch...'}
                className="text-lg font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Mô tả chi tiết *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={mode === 'task' ? 'Mô tả chi tiết công việc cần thực hiện...' : 'Mô tả chi tiết kế hoạch...'}
                rows={4}
                className="resize-none"
                required
              />
            </div>
          </div>

          {/* Task Type Selection - Same as TaskFormDialog */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Loại {mode === 'task' ? 'công việc' : 'kế hoạch'} *
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                (Chọn ít nhất 1 loại)
              </span>
            </label>
            <TaskTypeSelector
              selectedTypes={formData.types}
              onTypeToggle={handleTypeToggle}
              taskTypeConfig={taskTypeConfig}
            />
          </div>

          {/* Status and Priority Section - Same as TaskFormDialog */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mode === 'task' && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trạng thái
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleInputChange('status', key)}
                        className={cn(
                          'p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 text-sm font-medium',
                          formData.status === key
                            ? config.color + ' ring-2 ring-blue-500 ring-offset-2'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        )}
                      >
                        <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
                        <IconComponent className="h-4 w-4" />
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Độ ưu tiên
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(priorityConfig).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleInputChange('priority', key)}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 text-sm font-medium',
                        formData.priority === key
                          ? config.color + ' ring-2 ring-blue-500 ring-offset-2'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      )}
                    >
                      <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
                      <IconComponent className="h-4 w-4" />
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date and Time Section - Same as TaskFormDialog */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {mode === 'task' ? 'Ngày thực hiện' : 'Ngày lên lịch'} *
                </label>
                <DateTimePicker
                  date={selectedDate}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      handleInputChange('date', date.toISOString().split('T')[0]);
                    }
                  }}
                  placeholder={mode === 'task' ? 'Chọn ngày thực hiện' : 'Chọn ngày lên lịch'}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Thời gian
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Deadline Section - Same as TaskFormDialog */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Hạn chót (tùy chọn)
                </label>
                {!selectedDeadline && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDeadline(new Date())}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Thêm hạn chót
                  </Button>
                )}
              </div>

              {selectedDeadline && (
                <div className="flex items-center gap-2">
                  <DateTimePicker
                    date={selectedDeadline}
                    onDateChange={(date) => {
                      setSelectedDeadline(date);
                      if (date) {
                        handleInputChange('deadline', date.toISOString().split('T')[0]);
                      }
                    }}
                    placeholder="Chọn hạn chót"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDeadline(null);
                      handleInputChange('deadline', '');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Plan-specific Options - Only show when mode is 'plan' */}
          {mode === 'plan' && (
            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tùy chọn kế hoạch
              </h3>

              <div className="space-y-4">
                {/* Auto-create task option */}
                <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <input
                    type="checkbox"
                    id="auto_create_task"
                    checked={formData.auto_create_task}
                    onChange={(e) => handleInputChange('auto_create_task', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="auto_create_task" className="text-sm font-medium text-gray-900 dark:text-white">
                    🤖 Tự động tạo công việc khi đến ngày lên lịch
                  </label>
                </div>

                {/* Recurring option */}
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium text-gray-900 dark:text-white">
                    🔄 Lặp lại theo chu kỳ
                  </label>
                </div>

                {/* Recurrence settings */}
                {formData.is_recurring && (
                  <div className="ml-6 space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Chu kỳ
                        </label>
                        <Select
                          value={formData.recurrence_pattern || 'weekly'}
                          onValueChange={(value) => handleInputChange('recurrence_pattern', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chu kỳ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Hàng ngày</SelectItem>
                            <SelectItem value="weekly">Hàng tuần</SelectItem>
                            <SelectItem value="monthly">Hàng tháng</SelectItem>
                            <SelectItem value="yearly">Hàng năm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Khoảng cách
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.recurrence_interval}
                          onChange={(e) => handleInputChange('recurrence_interval', parseInt(e.target.value) || 1)}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Kết thúc
                        </label>
                        <Input
                          type="date"
                          value={formData.recurrence_end_date || ''}
                          onChange={(e) => handleInputChange('recurrence_end_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Reminder setting */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Bell className="h-4 w-4 inline mr-2" />
                    Nhắc nhở trước (tùy chọn)
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.reminder_date || ''}
                    onChange={(e) => handleInputChange('reminder_date', e.target.value)}
                    placeholder="Chọn thời gian nhắc nhở"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Ghi chú thêm
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Ghi chú thêm cho kế hoạch..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Footer with buttons - Same as TaskFormDialog */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'task' ? 'Đang tạo công việc...' : 'Đang tạo kế hoạch...'}
                </div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {mode === 'task' ? 'Tạo công việc' : 'Tạo kế hoạch'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedTaskPlanDialog;
