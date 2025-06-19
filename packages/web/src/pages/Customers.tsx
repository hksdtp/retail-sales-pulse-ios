import React, { useState } from 'react';
import { CustomerList } from '@/components/customers/CustomerList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, UserCheck, Building, ArrowLeft, Plus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/services/CustomerService';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Customers: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'customer',
    notes: ''
  });

  // Get permissions for current user
  const permissions = currentUser ? customerService.getCustomerPermissions(currentUser) : null;

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle add customer
  const handleAddCustomer = () => {
    setShowAddDialog(true);
  };

  // Handle save customer
  const handleSaveCustomer = async () => {
    console.log('🔍 Debug currentUser:', currentUser);
    console.log('🔍 Debug currentUser.id:', currentUser?.id);

    if (!currentUser) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập lại',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser.id) {
      toast({
        title: 'Lỗi',
        description: 'Thông tin người dùng không hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate fallback ID if needed
      const userId = currentUser.id || `user_${Date.now()}`;

      // Create customer object
      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        type: formData.type,
        notes: formData.notes.trim() || undefined,
        assignedTo: userId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try to save customer using customerService
      let savedCustomer;
      try {
        savedCustomer = await customerService.createCustomer(customerData, currentUser);
      } catch (serviceError) {
        console.error('CustomerService failed, using fallback:', serviceError);

        // Fallback: Save to localStorage
        const fallbackCustomer = {
          ...customerData,
          id: `customer_${Date.now()}`,
        };

        const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        existingCustomers.push(fallbackCustomer);
        localStorage.setItem('customers', JSON.stringify(existingCustomers));

        savedCustomer = fallbackCustomer;
      }

      if (savedCustomer) {
        // Add to local state
        setCustomers(prev => [...prev, savedCustomer]);

        // Show success toast
        toast({
          title: 'Thành công',
          description: `Đã thêm khách hàng "${formData.name}"`,
        });

        // Close dialog and reset form
        setShowAddDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm khách hàng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form helper
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      type: 'customer',
      notes: ''
    });
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAddDialog(false);
    resetForm();
  };

  // Load customers
  const loadCustomers = async () => {
    if (!currentUser) return;

    try {
      // Try to load from customerService first
      const customerList = await customerService.getCustomers(currentUser);
      setCustomers(customerList);
    } catch (error) {
      console.error('Error loading customers from service, trying localStorage:', error);

      // Fallback: Load from localStorage
      try {
        const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        setCustomers(localCustomers);
        console.log('Loaded customers from localStorage:', localCustomers.length);
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        setCustomers([]);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách khách hàng',
          variant: 'destructive',
        });
      }
    }
  };

  // Load customers on mount
  React.useEffect(() => {
    loadCustomers();
  }, [currentUser]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                Quản lý khách hàng
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Quản lý thông tin khách hàng, kiến trúc sư và đối tác
              </p>
            </div>
          </div>
        </div>

        {/* Permission Info */}
        {permissions && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Quyền hạn của bạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${permissions.canViewAll ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Xem tất cả khách hàng</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${permissions.canViewTeam ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Xem khách hàng nhóm</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${permissions.canCreate ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Tạo khách hàng mới</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${permissions.canAssign ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Phân công khách hàng</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                  <p className="text-2xl font-bold text-blue-600">--</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kiến trúc sư</p>
                  <p className="text-2xl font-bold text-green-600">--</p>
                </div>
                <Building className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đối tác</p>
                  <p className="text-2xl font-bold text-purple-600">--</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                <CardTitle>Danh sách khách hàng</CardTitle>
                <span className="text-sm text-gray-500">({customers.length})</span>
              </div>
              <Button onClick={handleAddCustomer}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm khách hàng
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có khách hàng nào
                </h3>
                <p className="text-gray-500 mb-4">
                  Bắt đầu bằng cách thêm khách hàng đầu tiên
                </p>
                <Button onClick={handleAddCustomer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khách hàng đầu tiên
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <Card key={customer.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{customer.name}</h4>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                          {customer.email && (
                            <p className="text-sm text-gray-600">{customer.email}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            customer.type === 'customer' ? 'bg-blue-100 text-blue-800' :
                            customer.type === 'architect' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {customer.type === 'customer' ? 'KH' :
                             customer.type === 'architect' ? 'KTS' : 'ĐT'}
                          </span>
                        </div>
                      </div>

                      {customer.address && (
                        <p className="text-sm text-gray-500 mb-2">{customer.address}</p>
                      )}

                      {customer.notes && (
                        <p className="text-sm text-gray-500 italic">{customer.notes}</p>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          Thêm: {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Thêm khách hàng mới
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên khách hàng *</Label>
              <Input
                id="name"
                placeholder="Nhập tên khách hàng"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Loại khách hàng</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                  <SelectItem value="architect">Kiến trúc sư</SelectItem>
                  <SelectItem value="partner">Đối tác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Nhập ghi chú (tùy chọn)"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveCustomer}
              disabled={!formData.name.trim() || !formData.phone.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khách hàng
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Customers;
