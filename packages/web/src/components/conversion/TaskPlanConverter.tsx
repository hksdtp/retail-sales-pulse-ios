import React, { useState } from 'react';
import { AnimatedModal } from '@/components/ui/animated-dialog';
import { AnimatedButton } from '@/components/ui/animated-button';
import { useToast } from '@/hooks/use-toast';
import { PlanService } from '@/services/PlanService';
import { TaskToPlanConversion, PlanToTaskConversion } from '@/types/plan';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Repeat, 
  Bell,
  CheckCircle,
  Target
} from 'lucide-react';

interface TaskToPlanConverterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onConversionComplete?: (plan: any) => void;
}

export const TaskToPlanConverter: React.FC<TaskToPlanConverterProps> = ({
  open,
  onOpenChange,
  task,
  onConversionComplete
}) => {
  const { toast } = useToast();
  const [planService] = useState(() => new PlanService());
  const [isConverting, setIsConverting] = useState(false);
  const [conversionData, setConversionData] = useState<TaskToPlanConversion>({
    task_id: task?.id || '',
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    scheduled_time: '09:00',
    is_recurring: false,
    auto_create_task: true
  });

  const handleConvert = async () => {
    if (!task) return;

    setIsConverting(true);
    try {
      const plan = await planService.convertTaskToPlan(task.id, conversionData);
      
      toast({
        title: 'Chuyển đổi thành công',
        description: `Đã tạo kế hoạch "${plan.title}" từ công việc "${task.title}".`,
      });

      onConversionComplete?.(plan);
      onOpenChange(false);
    } catch (error) {
      console.error('Error converting task to plan:', error);
      toast({
        title: 'Lỗi chuyển đổi',
        description: 'Không thể chuyển đổi công việc thành kế hoạch.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  if (!task) return null;

  return (
    <AnimatedModal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      size="md"
    >
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Chuyển thành kế hoạch</h2>
          <p className="text-muted-foreground mt-2">
            Lên lịch cho công việc "{task.title}" trong tương lai
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-medium mb-2">Thông tin công việc hiện tại:</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Tiêu đề:</strong> {task.title}</p>
            <p><strong>Mô tả:</strong> {task.description}</p>
            <p><strong>Loại:</strong> {task.type}</p>
            <p><strong>Độ ưu tiên:</strong> {task.priority}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Ngày lên lịch *
              </label>
              <input
                type="date"
                value={conversionData.scheduled_date}
                onChange={(e) => setConversionData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Thời gian
              </label>
              <input
                type="time"
                value={conversionData.scheduled_time || '09:00'}
                onChange={(e) => setConversionData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Bell className="h-4 w-4 inline mr-1" />
              Nhắc nhở trước (tùy chọn)
            </label>
            <input
              type="datetime-local"
              value={conversionData.reminder_date || ''}
              onChange={(e) => setConversionData(prev => ({ ...prev, reminder_date: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_create_task"
                checked={conversionData.auto_create_task !== false}
                onChange={(e) => setConversionData(prev => ({ ...prev, auto_create_task: e.target.checked }))}
                className="rounded border-border"
              />
              <label htmlFor="auto_create_task" className="text-sm">
                Tự động tạo công việc mới khi đến ngày lên lịch
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_recurring"
                checked={conversionData.is_recurring || false}
                onChange={(e) => setConversionData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                className="rounded border-border"
              />
              <label htmlFor="is_recurring" className="text-sm">
                <Repeat className="h-4 w-4 inline mr-1" />
                Lặp lại theo chu kỳ
              </label>
            </div>

            {conversionData.is_recurring && (
              <div className="ml-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Chu kỳ</label>
                  <select
                    value={conversionData.recurrence_pattern || 'weekly'}
                    onChange={(e) => setConversionData(prev => ({ ...prev, recurrence_pattern: e.target.value as any }))}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                    <option value="yearly">Hàng năm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Khoảng cách</label>
                  <input
                    type="number"
                    min="1"
                    value={conversionData.recurrence_interval || 1}
                    onChange={(e) => setConversionData(prev => ({ ...prev, recurrence_interval: parseInt(e.target.value) || 1 }))}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <AnimatedButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isConverting}
          >
            Hủy
          </AnimatedButton>
          <AnimatedButton
            onClick={handleConvert}
            className="flex-1"
            loading={isConverting}
            loadingText="Đang chuyển đổi..."
          >
            Tạo kế hoạch
          </AnimatedButton>
        </div>
      </div>
    </AnimatedModal>
  );
};

interface PlanToTaskConverterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: any;
  onConversionComplete?: (task: any) => void;
}

export const PlanToTaskConverter: React.FC<PlanToTaskConverterProps> = ({
  open,
  onOpenChange,
  plan,
  onConversionComplete
}) => {
  const { toast } = useToast();
  const [planService] = useState(() => new PlanService());
  const [isConverting, setIsConverting] = useState(false);
  const [conversionData, setConversionData] = useState<PlanToTaskConversion>({
    plan_id: plan?.id || '',
    execution_date: new Date().toISOString().split('T')[0],
    inherit_properties: true
  });

  const handleConvert = async () => {
    if (!plan) return;

    setIsConverting(true);
    try {
      const task = await planService.convertPlanToTask(plan.id, conversionData);
      
      toast({
        title: 'Chuyển đổi thành công',
        description: `Đã tạo công việc "${task.title}" từ kế hoạch "${plan.title}".`,
      });

      onConversionComplete?.(task);
      onOpenChange(false);
    } catch (error) {
      console.error('Error converting plan to task:', error);
      toast({
        title: 'Lỗi chuyển đổi',
        description: 'Không thể chuyển đổi kế hoạch thành công việc.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  if (!plan) return null;

  return (
    <AnimatedModal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      size="md"
    >
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Chuyển thành công việc</h2>
          <p className="text-muted-foreground mt-2">
            Tạo công việc thực tế từ kế hoạch "{plan.title}"
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-medium mb-2">Thông tin kế hoạch:</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Tiêu đề:</strong> {plan.title}</p>
            <p><strong>Mô tả:</strong> {plan.description}</p>
            <p><strong>Ngày lên lịch:</strong> {plan.scheduled_date}</p>
            <p><strong>Thời gian:</strong> {plan.scheduled_time}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Ngày thực hiện *
            </label>
            <input
              type="date"
              value={conversionData.execution_date}
              onChange={(e) => setConversionData(prev => ({ ...prev, execution_date: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inherit_properties"
              checked={conversionData.inherit_properties}
              onChange={(e) => setConversionData(prev => ({ ...prev, inherit_properties: e.target.checked }))}
              className="rounded border-border"
            />
            <label htmlFor="inherit_properties" className="text-sm">
              Kế thừa tất cả thuộc tính từ kế hoạch
            </label>
          </div>

          {!conversionData.inherit_properties && (
            <div className="space-y-4 ml-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiêu đề tùy chỉnh
                </label>
                <input
                  type="text"
                  value={conversionData.custom_title || ''}
                  onChange={(e) => setConversionData(prev => ({ ...prev, custom_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  placeholder={plan.title}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả tùy chỉnh
                </label>
                <textarea
                  value={conversionData.custom_description || ''}
                  onChange={(e) => setConversionData(prev => ({ ...prev, custom_description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder={plan.description}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Độ ưu tiên tùy chỉnh
                </label>
                <select
                  value={conversionData.custom_priority || plan.priority}
                  onChange={(e) => setConversionData(prev => ({ ...prev, custom_priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="low">Thấp</option>
                  <option value="normal">Bình thường</option>
                  <option value="high">Cao</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <AnimatedButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isConverting}
          >
            Hủy
          </AnimatedButton>
          <AnimatedButton
            onClick={handleConvert}
            className="flex-1"
            loading={isConverting}
            loadingText="Đang chuyển đổi..."
          >
            Tạo công việc
          </AnimatedButton>
        </div>
      </div>
    </AnimatedModal>
  );
};

export { TaskToPlanConverter, PlanToTaskConverter };
