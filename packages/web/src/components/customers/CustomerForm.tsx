import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Customer, CustomerFormData, CUSTOMER_TYPES } from '@/types/customer';
import { customerService } from '@/services/CustomerService';
import { customerGoogleSheetsService } from '@/services/CustomerGoogleSheetsService';
import { User } from '@/types/user';
import { Loader2, Save, X } from 'lucide-react';

const customerFormSchema = z.object({
  name: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  type: z.enum(['customer', 'architect', 'partner'], {
    required_error: 'Vui lòng chọn loại khách hàng',
  }),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
  mode: 'create' | 'edit';
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
  mode,
}) => {
  const { currentUser, users } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      type: 'customer',
      phone: '',
      email: '',
      address: '',
      notes: '',
      assignedTo: '',
    },
  });

  // Reset form khi customer thay đổi
  useEffect(() => {
    if (customer && mode === 'edit') {
      form.reset({
        name: customer.name,
        type: customer.type,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || '',
        assignedTo: customer.assignedTo,
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        type: 'customer',
        phone: '',
        email: '',
        address: '',
        notes: '',
        assignedTo: currentUser?.id || '',
      });
    }
  }, [customer, mode, form, currentUser]);

  const onSubmit = async (data: CustomerFormData) => {
    if (!currentUser) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy thông tin người dùng',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      let result: Customer | boolean | null = null;

      if (mode === 'create') {
        result = await customerService.createCustomer(data, currentUser);
        
        if (result) {
          // Lưu vào Google Sheets
          const assignedUser = users.find(u => u.id === data.assignedTo) || currentUser;
          await customerGoogleSheetsService.saveCustomerToEmployeeSheet(result as Customer, assignedUser);
          
          toast({
            title: 'Thành công',
            description: 'Đã tạo khách hàng mới',
          });
        }
      } else if (customer) {
        result = await customerService.updateCustomer(customer.id, data, currentUser);
        
        if (result) {
          // Cập nhật Google Sheets
          const assignedUser = users.find(u => u.id === data.assignedTo) || currentUser;
          const updatedCustomer: Customer = { ...customer, ...data };
          await customerGoogleSheetsService.updateCustomerInEmployeeSheet(updatedCustomer, assignedUser);
          
          toast({
            title: 'Thành công',
            description: 'Đã cập nhật thông tin khách hàng',
          });
        }
      }

      if (result) {
        onSuccess();
        onClose();
        form.reset();
      } else {
        throw new Error('Không thể lưu thông tin khách hàng');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu thông tin khách hàng',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc users có thể được assign
  const getAssignableUsers = (): User[] => {
    if (!currentUser) return [];

    const permissions = customerService.getCustomerPermissions(currentUser);
    
    if (permissions.canAssign) {
      // Admin/Director/Team Leader có thể assign cho bất kỳ ai
      if (permissions.canViewAll) {
        return users;
      } else if (permissions.canViewTeam) {
        // Team leader chỉ assign trong team
        return users.filter(u => u.team_id === currentUser.team_id);
      }
    }

    // Nhân viên chỉ có thể assign cho chính mình
    return [currentUser];
  };

  const assignableUsers = getAssignableUsers();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? '➕ Thêm khách hàng mới' : '✏️ Chỉnh sửa khách hàng'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên khách hàng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại khách hàng *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại khách hàng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUSTOMER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số điện thoại" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập địa chỉ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người phụ trách</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn người phụ trách" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Nhập ghi chú về khách hàng" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
