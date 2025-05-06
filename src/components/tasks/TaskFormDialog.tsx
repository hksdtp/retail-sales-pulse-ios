
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

// Schema xác thực form
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Tiêu đề phải có ít nhất 3 ký tự"
  }),
  description: z.string().min(10, {
    message: "Mô tả phải có ít nhất 10 ký tự"
  }),
  type: z.enum(['partner', 'architect', 'client', 'quote'], {
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
}

const TaskFormDialog = ({ open, onOpenChange }: TaskFormDialogProps) => {
  const { currentUser, teams, users } = useAuth();
  const { toast } = useToast();
  const [canAssignToOthers, setCanAssignToOthers] = useState(false);
  
  useEffect(() => {
    // Chỉ giám đốc và trưởng nhóm mới có thể giao việc cho người khác
    setCanAssignToOthers(currentUser?.role === 'director' || currentUser?.role === 'team_leader');
  }, [currentUser]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'partner',
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

  const onSubmit = (data: FormValues) => {
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
    // Ở đây sẽ thêm logic lưu dữ liệu
    // Trong thực tế, ta sẽ kết nối API hoặc cơ sở dữ liệu

    toast({
      title: "Thành công!",
      description: "Công việc đã được tạo thành công."
    });

    // Đóng form sau khi submit
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentUser?.role === 'employee' ? 'Tạo công việc mới cho bản thân' : 'Tạo công việc mới'}
          </DialogTitle>
          <DialogDescription>
            {currentUser?.role === 'employee' 
              ? 'Thêm công việc mới cho bản thân' 
              : 'Thêm công việc mới cho nhóm hoặc phòng kinh doanh'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề công việc</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề công việc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết về công việc" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại công việc</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại công việc" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="partner">Đối tác</SelectItem>
                        <SelectItem value="architect">KTS</SelectItem>
                        <SelectItem value="client">Khách hàng</SelectItem>
                        <SelectItem value="quote">Báo giá</SelectItem>
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
                    <FormLabel>Trạng thái</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">Chưa bắt đầu</SelectItem>
                        <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                        <SelectItem value="on-hold">Đang chờ</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian (nếu có)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
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
                    <FormLabel>Người thực hiện</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value || currentUser?.id}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người thực hiện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-sm mb-1">Thông tin người tạo:</p>
              <p className="text-xs">Người tạo: <strong>{currentUser?.name}</strong></p>
              <p className="text-xs">Vị trí: <strong>{currentUser?.position}</strong></p>
              <p className="text-xs">Khu vực: <strong>{currentUser?.location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'}</strong></p>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {currentUser?.role === 'employee' ? 'Tạo công việc cho bản thân' : 'Tạo công việc'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
