import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useContext } from 'react';
import { TaskDataContext } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Task } from '../types/TaskTypes';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';

// Schema xác thực form
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Tiêu đề phải có ít nhất 3 ký tự"
  }),
  description: z.string().min(10, {
    message: "Mô tả phải có ít nhất 10 ký tự"
  }),
  type: z.enum(['partner_new', 'partner_old', 'architect_new', 'architect_old', 'client_new', 'client_old', 'quote_new', 'quote_old', 'other'], {
    required_error: "Vui lòng chọn loại công việc"
  }),
  status: z.enum(['todo', 'in-progress', 'on-hold', 'completed'], {
    required_error: "Vui lòng chọn trạng thái"
  }),
  date: z.string().min(1, {
    message: "Vui lòng chọn ngày"
  }),
  time: z.string().optional(),
  assignedTo: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ open, onOpenChange, task }) => {
  // Lấy context xử lý công việc trực tiếp từ TaskDataContext
  const taskData = useContext(TaskDataContext);
  
  // Kiểm tra xem taskData có tồn tại không
  if (!taskData) {
    throw new Error('TaskEditDialog must be used within a TaskDataProvider');
  }
  
  const { updateTask } = taskData;
  const { users, currentUser, teams } = useAuth();
  const { toast } = useToast();
  const [canAssignToOthers, setCanAssignToOthers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<Array<{ id: string; name: string }>>([]);
  
  // Cấu hình form với giá trị mặc định từ task hiện tại
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      date: task.date,
      time: task.time || '',
      assignedTo: task.assignedTo,
      progress: task.progress,
    }
  });
  
  // Kiểm tra quyền gán việc cho người khác
  useEffect(() => {
    setCanAssignToOthers(
      currentUser?.role === 'retail_director' || 
      currentUser?.role === 'project_director' || 
      currentUser?.role === 'team_leader'
    );
    
    // Lọc danh sách người dùng
    if (currentUser && users) {
      let filteredList = users;
      
      if (currentUser.role === 'team_leader') {
        // Trưởng nhóm chỉ có thể gán cho thành viên trong nhóm
        filteredList = users.filter(user => user.team_id === currentUser.team_id);
      }
      
      setFilteredUsers(filteredList);
    }
  }, [currentUser, users]);
  
  // Xử lý khi submit form
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Cập nhật công việc
      await updateTask(task.id, {
        ...data,
        isNew: false, // Đánh dấu là không phải công việc mới nữa
      });
      
      toast({
        title: "Thành công!",
        description: "Công việc đã được cập nhật."
      });
      
      // Đóng form
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật công việc:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật công việc",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loại công việc
  const taskTypes = [
    { value: 'partner_new', label: 'Đối tác mới' },
    { value: 'partner_old', label: 'Đối tác cũ' },
    { value: 'architect_new', label: 'KTS mới' },
    { value: 'architect_old', label: 'KTS cũ' },
    { value: 'client_new', label: 'Khách hàng mới' },
    { value: 'client_old', label: 'Khách hàng cũ' },
    { value: 'quote_new', label: 'Báo giá mới' },
    { value: 'quote_old', label: 'Báo giá cũ' },
    { value: 'other', label: 'Khác' }
  ];
  
  // Trạng thái công việc
  const taskStatus = [
    { value: 'todo', label: 'Cần làm' },
    { value: 'in-progress', label: 'Đang thực hiện' },
    { value: 'on-hold', label: 'Tạm hoãn' },
    { value: 'completed', label: 'Đã hoàn thành' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Chỉnh sửa công việc</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin công việc. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2d3436] font-medium">Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nhập tiêu đề công việc" 
                      className="h-11 bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2d3436] font-medium">Mô tả *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Nhập mô tả chi tiết công việc" 
                      className="min-h-[100px] bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2d3436] font-medium">Loại công việc *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20">
                          <SelectValue placeholder="Chọn loại công việc" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-md border border-white/30 shadow-lg rounded-xl overflow-hidden">
                        {taskTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2d3436] font-medium">Trạng thái *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-md border border-white/30 shadow-lg rounded-xl overflow-hidden">
                        {taskStatus.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2d3436] font-medium">Tiến độ: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2d3436] font-medium">Ngày *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="h-11 w-full pl-3 text-left font-normal bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(new Date(field.value), 'dd/MM/yyyy', { locale: vi })
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => date && field.onChange(date.toISOString().split('T')[0])}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2d3436] font-medium">Thời gian</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="h-11 w-full pl-3 text-left font-normal bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {field.value ? field.value : <span>Chọn thời gian</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="start">
                        <div className="space-y-2">
                          <h4 className="font-medium">Chọn thời gian</h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <input
                                type="time"
                                className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {canAssignToOthers && filteredUsers.length > 0 && (
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2d3436] font-medium">Người thực hiện</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20">
                          <SelectValue placeholder="Chọn người thực hiện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-md border border-white/30 shadow-lg rounded-xl overflow-hidden">
                        {filteredUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} {user.id === currentUser?.id ? '(Bản thân)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="mt-6 space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                className="h-11 px-5 rounded-xl border-gray-200 hover:bg-gray-100/50 hover:border-gray-300 hover:translate-y-[-1px] transition-all"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#4ecdc4] hover:opacity-90 hover:translate-y-[-1px] transition-all"
              >
                {isSubmitting ? 'Đang lưu...' : 'Cập nhật công việc'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
