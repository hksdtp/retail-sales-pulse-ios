import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Users, FileText, FilePen, Plus } from 'lucide-react';
import { googleSheetsService } from '@/services/GoogleSheetsService';
import { Calendar, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  team_id: z.string().optional(),
  assignedTo: z.string().optional() // Thêm trường để chỉ định người được giao công việc
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formType?: 'self' | 'team' | 'individual';
}

const TaskFormDialog = ({ open, onOpenChange, formType = 'self' }: TaskFormDialogProps) => {
  const { currentUser, teams, users } = useAuth();
  const { toast } = useToast();
  const [canAssignToOthers, setCanAssignToOthers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSheetsConfigured, setIsGoogleSheetsConfigured] = useState(false);
  
  useEffect(() => {
    // Chỉ giám đốc và trưởng nhóm mới có thể giao việc cho người khác
    setCanAssignToOthers(currentUser?.role === 'director' || currentUser?.role === 'team_leader');
    
    // Kiểm tra xem Google Sheets đã được cấu hình chưa
    setIsGoogleSheetsConfigured(googleSheetsService.isConfigured());
  }, [currentUser]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'partner_new',
      status: 'todo',
      date: new Date().toISOString().split('T')[0], // Ngày hiện tại
      time: '',
      team_id: currentUser?.team_id,
      assignedTo: currentUser?.id // Mặc định gán cho người dùng hiện tại
    }
  });

  // Lọc danh sách người dùng dựa trên vai trò và nhóm
  const getFilteredUsers = () => {
    if (!currentUser || !users) return [];
    
    if (currentUser.role === 'director') {
      // Giám đốc có thể giao việc cho bất kỳ ai
      return users;
    } else if (currentUser.role === 'team_leader') {
      // Trưởng nhóm chỉ có thể giao việc cho thành viên trong nhóm của mình
      return users.filter(user => user.team_id === currentUser.team_id);
    } else {
      // Nhân viên chỉ có thể tạo việc cho chính mình
      return users.filter(user => user.id === currentUser.id);
    }
  };

  const filteredUsers = getFilteredUsers();

  const onSubmit = async (data: FormValues) => {
    if (!isGoogleSheetsConfigured) {
      toast({
        title: "Cảnh báo",
        description: "Google Sheets chưa được cấu hình. Vui lòng cấu hình Service Account để lưu dữ liệu.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Đảm bảo có người được giao công việc
      const assignee = data.assignedTo || currentUser?.id;
      
      // Thêm thông tin người dùng vào dữ liệu công việc
      const taskWithUserInfo = {
        ...data,
        user_id: currentUser?.id, // Người tạo
        user_name: currentUser?.name,
        team_id: currentUser?.team_id,
        location: currentUser?.location,
        assignedTo: assignee, // Người được giao việc
        created_at: new Date().toISOString()
      };
      
      console.log("Dữ liệu công việc mới:", taskWithUserInfo);
      
      // Lưu dữ liệu vào Google Sheets
      await googleSheetsService.saveTask(taskWithUserInfo);

      toast({
        title: "Thành công!",
        description: "Công việc đã được tạo và lưu vào Google Sheets."
      });

      // Đóng form sau khi submit thành công
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Lỗi khi tạo công việc:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo công việc",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm lấy biểu tượng cho loại công việc
  const getTypeIcon = (type: string) => {
    if (type.startsWith('partner')) return <Briefcase className="mr-2 h-4 w-4" />;
    if (type.startsWith('architect')) return <FilePen className="mr-2 h-4 w-4" />;
    if (type.startsWith('client')) return <Users className="mr-2 h-4 w-4" />;
    if (type.startsWith('quote')) return <FileText className="mr-2 h-4 w-4" />;
    return <Plus className="mr-2 h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] md:max-w-[650px] lg:max-w-[750px] bg-white/95 backdrop-blur-lg border border-white/30 shadow-xl rounded-[20px]">
        <DialogHeader className="space-y-2 pb-2">
          <DialogTitle className="text-xl md:text-2xl font-bold text-[#2d3436] tracking-wide">
            {formType === 'self' && "Tạo công việc mới cho bản thân"}
            {formType === 'team' && "Giao công việc cho Nhóm/Cá nhân"}
            {formType === 'individual' && "Giao công việc cho thành viên"}
          </DialogTitle>
          <DialogDescription className="text-[#636e72] text-sm md:text-base font-medium">
            {/* Ẩn phần mô tả của tạo công việc cho bản thân */}
            {formType === 'team' && "Phân công công việc cho nhóm hoặc cá nhân bất kỳ"}
            {formType === 'individual' && "Phân công công việc cho các thành viên trong nhóm"}
          </DialogDescription>
        </DialogHeader>

        {!isGoogleSheetsConfigured && (
          <Alert className="bg-amber-50 border-amber-300 text-amber-800 mb-4">
            <AlertDescription>
              Bạn cần cấu hình Google Sheets Service Account trước khi có thể tạo công việc mới.
              Vui lòng nhấn vào biểu tượng Cài đặt ở góc trên bên phải.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mt-0">
                  <FormLabel className="text-[#2d3436] font-medium">Tiêu đề công việc</FormLabel>
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
                  <FormLabel className="text-[#2d3436] font-medium">Mô tả</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết về công việc" 
                      className="min-h-[100px] bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20 resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2d3436] font-medium">Loại công việc</FormLabel>
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
                        <SelectItem value="partner_new" className="flex items-center">
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                            <span className="text-blue-700 font-medium">Đối tác mới</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="partner_old" className="flex items-center">
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-blue-400" />
                            <span className="text-blue-600">Đối tác cũ</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="architect_new" className="flex items-center">
                          <div className="flex items-center">
                            <FilePen className="mr-2 h-4 w-4 text-purple-500" />
                            <span className="text-purple-700 font-medium">KTS mới</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="architect_old" className="flex items-center">
                          <div className="flex items-center">
                            <FilePen className="mr-2 h-4 w-4 text-purple-400" />
                            <span className="text-purple-600">KTS cũ</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="client_new" className="flex items-center">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-green-700 font-medium">Khách hàng mới</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="client_old" className="flex items-center">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-green-400" />
                            <span className="text-green-600">Khách hàng cũ</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="quote_new" className="flex items-center">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-amber-500" />
                            <span className="text-amber-700 font-medium">Báo giá mới</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="quote_old" className="flex items-center">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-amber-400" />
                            <span className="text-amber-600">Báo giá cũ</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="other" className="flex items-center">
                          <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Khác</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2d3436] font-medium">Trạng thái</FormLabel>
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
                        <SelectItem value="todo" className="flex items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                            <span className="text-gray-700 font-medium">Chưa bắt đầu</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="in-progress" className="flex items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-blue-700 font-medium">Đang thực hiện</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="on-hold" className="flex items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
                            <span className="text-amber-700 font-medium">Đang chờ</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="completed" className="flex items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-green-700 font-medium">Hoàn thành</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                control={form.control}
                name="date"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#2d3436] font-medium">Ngày</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <button
                            className={`flex h-11 items-center justify-between rounded-xl border border-gray-200/50 bg-white/70 backdrop-blur-sm pl-4 pr-3 py-2 text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/20 focus:border-[#6c5ce7] hover:border-[#6c5ce7]/50 transition-all shadow-sm ${fieldState.invalid ? 'border-red-500' : ''}`}
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#6c5ce7]" />
                              <span>
                                {field.value
                                  ? format(new Date(field.value), 'dd/MM/yyyy', { locale: vi })
                                  : 'Chọn ngày'}
                              </span>
                            </div>
                            <div className="ml-auto">
                              <Calendar className="h-4 w-4 text-[#6c5ce7]" />
                            </div>
                          </button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border border-white/30 shadow-xl rounded-xl" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                          className="rounded-xl border-none shadow-none p-3"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="time"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#2d3436] font-medium">Thời gian (nếu có)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <button
                            className={`flex h-11 w-full items-center justify-between rounded-xl border border-gray-200/50 bg-white/70 backdrop-blur-sm pl-4 pr-3 py-2 text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/20 focus:border-[#6c5ce7] hover:border-[#6c5ce7]/50 transition-all shadow-sm ${fieldState.invalid ? 'border-red-500' : ''}`}
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#6c5ce7]" />
                              <span className="text-[#2d3436]">
                                {field.value ? field.value : 'Chọn thời gian'}
                              </span>
                            </div>
                          </button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-3 bg-white/95 backdrop-blur-md border border-white/30 shadow-xl rounded-xl" align="start">
                        <div className="flex flex-col space-y-3">
                          <div className="grid grid-cols-4 gap-2">
                            {['07:00', '08:00', '09:00', '10:00'].map(time => (
                              <button
                                key={time}
                                className={`p-2 rounded-lg text-sm ${field.value === time ? 'bg-[#6c5ce7] text-white' : 'hover:bg-gray-100'}`}
                                onClick={() => {
                                  field.onChange(time);
                                  document.querySelector('[data-state="open"]')?.dispatchEvent(
                                    new KeyboardEvent('keydown', { key: 'Escape' })
                                  );
                                }}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {['11:00', '13:00', '14:00', '15:00'].map(time => (
                              <button
                                key={time}
                                className={`p-2 rounded-lg text-sm ${field.value === time ? 'bg-[#6c5ce7] text-white' : 'hover:bg-gray-100'}`}
                                onClick={() => {
                                  field.onChange(time);
                                  document.querySelector('[data-state="open"]')?.dispatchEvent(
                                    new KeyboardEvent('keydown', { key: 'Escape' })
                                  );
                                }}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {['16:00', '17:00', '18:00', '19:00'].map(time => (
                              <button
                                key={time}
                                className={`p-2 rounded-lg text-sm ${field.value === time ? 'bg-[#6c5ce7] text-white' : 'hover:bg-gray-100'}`}
                                onClick={() => {
                                  field.onChange(time);
                                  document.querySelector('[data-state="open"]')?.dispatchEvent(
                                    new KeyboardEvent('keydown', { key: 'Escape' })
                                  );
                                }}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex items-center">
                              <input
                                type="time"
                                className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <button 
                                className="ml-2 p-2 rounded-lg bg-[#6c5ce7] text-white text-sm"
                                onClick={() => {
                                  document.querySelector('[data-state="open"]')?.dispatchEvent(
                                    new KeyboardEvent('keydown', { key: 'Escape' })
                                  );
                                }}
                              >
                                Chọn
                              </button>
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
                      defaultValue={field.value || currentUser?.id}
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

            {/* Phần thông tin người tạo đã được ẩn theo yêu cầu */}

            {/* Phần hướng dẫn đã được xóa theo yêu cầu */}

            <DialogFooter className="mt-8 space-x-3">
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
                disabled={isSubmitting || !isGoogleSheetsConfigured}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#4ecdc4] hover:opacity-90 hover:translate-y-[-1px] transition-all"
              >
                {isSubmitting ? 'Đang lưu...' : (
                  formType === 'self' ? 'Tạo công việc cho bản thân' : 
                  formType === 'team' ? 'Giao công việc cho Nhóm/Cá nhân' : 
                  'Giao công việc cho thành viên'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
