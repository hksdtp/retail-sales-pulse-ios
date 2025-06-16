import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Customer, CustomerFilters, CUSTOMER_TYPES } from '@/types/customer';
import { customerService } from '@/services/CustomerService';
import { customerGoogleSheetsService } from '@/services/CustomerGoogleSheetsService';
import { CustomerCard } from './CustomerCard';
import { CustomerForm } from './CustomerForm';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Loader2,
  RefreshCw,
  Download
} from 'lucide-react';

export const CustomerList: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { toast } = useToast();

  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Permissions
  const permissions = currentUser ? customerService.getCustomerPermissions(currentUser) : null;

  // Load customers
  const loadCustomers = async (showLoader = true) => {
    if (!currentUser) return;

    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const customerList = await customerService.getCustomers(currentUser, filters);
      setCustomers(customerList);
      setFilteredCustomers(customerList);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách khách hàng',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCustomers();
  }, [currentUser, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.address?.toLowerCase().includes(searchLower)
    );
    
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  // Handle create customer
  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setFormMode('create');
    setShowForm(true);
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormMode('edit');
    setShowForm(true);
  };

  // Handle delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!customerToDelete || !currentUser) return;

    try {
      const success = await customerService.deleteCustomer(customerToDelete.id);
      
      if (success) {
        // Xóa khỏi Google Sheets
        const assignedUser = users.find(u => u.id === customerToDelete.assignedTo) || currentUser;
        await customerGoogleSheetsService.deleteCustomerFromEmployeeSheet(customerToDelete.id, assignedUser);
        
        toast({
          title: 'Thành công',
          description: 'Đã xóa khách hàng',
        });
        
        loadCustomers(false);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa khách hàng',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setCustomerToDelete(null);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    loadCustomers(false);
  };

  // Handle sync to Google Sheets
  const handleSyncToSheets = async () => {
    if (!currentUser) return;

    try {
      setIsRefreshing(true);
      
      // Sync customers của user hiện tại
      const userCustomers = customers.filter(c => c.assignedTo === currentUser.id);
      await customerGoogleSheetsService.syncEmployeeCustomers(userCustomers, currentUser);
      
      toast({
        title: 'Thành công',
        description: 'Đã đồng bộ khách hàng lên Google Sheets',
      });
    } catch (error) {
      console.error('Error syncing to sheets:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể đồng bộ lên Google Sheets',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Đang tải danh sách khách hàng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <CardTitle>Danh sách khách hàng</CardTitle>
              <span className="text-sm text-gray-500">({filteredCustomers.length})</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCustomers(false)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              
              {customerGoogleSheetsService.isConfigured() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncToSheets}
                  disabled={isRefreshing}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Đồng bộ Sheets
                </Button>
              )}
              
              {permissions?.canCreate && (
                <Button onClick={handleCreateCustomer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khách hàng
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filters.type || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Loại KH" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {CUSTOMER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {permissions?.canViewTeam && (
                <Select
                  value={filters.assignedTo || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, assignedTo: value || undefined }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Người phụ trách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Customer Grid */}
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                  : 'Bắt đầu bằng cách thêm khách hàng đầu tiên'
                }
              </p>
              {permissions?.canCreate && !searchTerm && (
                <Button onClick={handleCreateCustomer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khách hàng đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={permissions?.canEdit ? handleEditCustomer : undefined}
                  onDelete={permissions?.canDelete ? handleDeleteCustomer : undefined}
                  canEdit={permissions?.canEdit || false}
                  canDelete={permissions?.canDelete || false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <CustomerForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
        customer={selectedCustomer}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng "{customerToDelete?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
