import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const CustomersSimple: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'customer' as const,
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);

  // Mock customer data for testing
  const mockCustomers = [
    {
      id: '1',
      name: 'Công ty ABC',
      type: 'customer',
      phone: '0123456789',
      email: 'abc@company.com',
      address: 'Hà Nội',
      assignedToName: 'Khổng Đức Mạnh',
      createdAt: '2024-01-01',
      status: 'active',
      notes: 'Khách hàng tiềm năng'
    },
    {
      id: '2',
      name: 'KTS Nguyễn Văn A',
      type: 'architect',
      phone: '0987654321',
      email: 'architect@example.com',
      address: 'TP.HCM',
      assignedToName: 'Khổng Đức Mạnh',
      createdAt: '2024-01-02',
      status: 'active',
      notes: 'Kiến trúc sư có kinh nghiệm'
    },
    {
      id: '3',
      name: 'Đối tác XYZ',
      type: 'partner',
      phone: '0555666777',
      email: 'partner@xyz.com',
      address: 'Đà Nẵng',
      assignedToName: 'Khổng Đức Mạnh',
      createdAt: '2024-01-03',
      status: 'active',
      notes: 'Đối tác phân phối'
    }
  ];

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    setError(null);

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load from localStorage or use initial data
      const stored = localStorage.getItem('customers_simple');
      if (stored) {
        setCustomers(JSON.parse(stored));
      } else {
        setCustomers(mockCustomers);
        localStorage.setItem('customers_simple', JSON.stringify(mockCustomers));
      }

    } catch (err) {
      setError('Không thể tải danh sách khách hàng');
      console.error('❌ Error loading customers:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const saveCustomers = (updatedCustomers: any[]) => {
    setCustomers(updatedCustomers);
    localStorage.setItem('customers_simple', JSON.stringify(updatedCustomers));
  };

  const handleCreateCustomer = () => {
    setFormMode('create');
    setSelectedCustomer(null);
    setFormData({
      name: '',
      type: 'customer',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setShowForm(true);
  };

  const handleEditCustomer = (customer: any) => {
    setFormMode('edit');
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      type: customer.type,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setShowForm(true);
  };

  const handleDeleteCustomer = (customer: any) => {
    setCustomerToDelete(customer);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!customerToDelete) return;

    const updatedCustomers = customers.filter(c => c.id !== customerToDelete.id);
    saveCustomers(updatedCustomers);

    setShowDeleteDialog(false);
    setCustomerToDelete(null);

  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formMode === 'create') {
      const newCustomer = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        type: formData.type,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        assignedToName: currentUser?.name || 'Unknown',
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const updatedCustomers = [...customers, newCustomer];
      saveCustomers(updatedCustomers);

    } else if (formMode === 'edit' && selectedCustomer) {
      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              name: formData.name.trim(),
              type: formData.type,
              phone: formData.phone.trim(),
              email: formData.email.trim() || undefined,
              address: formData.address.trim() || undefined,
              notes: formData.notes.trim() || undefined
            }
          : c
      );

      saveCustomers(updatedCustomers);

    }

    setShowForm(false);
    setError(null);
  };

  useEffect(() => {
    if (currentUser) {
      loadCustomers();
    }
  }, [currentUser]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'customer': return 'Khách hàng';
      case 'architect': return 'Kiến trúc sư';
      case 'partner': return 'Đối tác';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'architect': return 'bg-green-100 text-green-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chưa đăng nhập</h2>
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem danh sách khách hàng</p>
          <a href="/login" className="text-blue-600 hover:underline">
            → Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🧑‍💼 Quản lý khách hàng
              </h1>
              <p className="text-gray-600">
                Thêm, sửa, xóa và quản lý thông tin khách hàng, kiến trúc sư và đối tác
              </p>
            </div>
            <button
              onClick={handleCreateCustomer}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Thêm khách hàng
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Thông tin người dùng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Tên:</strong> {currentUser.name}
            </div>
            <div>
              <strong>Vai trò:</strong> {currentUser.role}
            </div>
            <div>
              <strong>Địa điểm:</strong> {currentUser.location}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                <p className="text-2xl font-bold text-blue-600">
                  {customers.filter(c => c.type === 'customer').length}
                </p>
              </div>
              <div className="text-blue-500 text-2xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kiến trúc sư</p>
                <p className="text-2xl font-bold text-green-600">
                  {customers.filter(c => c.type === 'architect').length}
                </p>
              </div>
              <div className="text-green-500 text-2xl">🏗️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đối tác</p>
                <p className="text-2xl font-bold text-purple-600">
                  {customers.filter(c => c.type === 'partner').length}
                </p>
              </div>
              <div className="text-purple-500 text-2xl">🤝</div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Danh sách khách hàng</h2>
              <button
                onClick={loadCustomers}
                disabled={isLoadingCustomers}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoadingCustomers ? 'Đang tải...' : 'Tải lại'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {isLoadingCustomers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải danh sách khách hàng...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Chưa có khách hàng nào</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  + Thêm khách hàng đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(customer.type)}`}>
                        {getTypeLabel(customer.type)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-2">📞</span>
                        <span>{customer.phone}</span>
                      </div>
                      
                      {customer.email && (
                        <div className="flex items-center">
                          <span className="mr-2">📧</span>
                          <span>{customer.email}</span>
                        </div>
                      )}
                      
                      {customer.address && (
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          <span>{customer.address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <span className="mr-2">👤</span>
                        <span>Phụ trách: {customer.assignedToName}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer)}
                            className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    {formMode === 'create' ? '➕ Thêm khách hàng mới' : '✏️ Sửa thông tin khách hàng'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách hàng *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tên khách hàng"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại khách hàng *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="architect">Kiến trúc sư</option>
                      <option value="partner">Đối tác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập ghi chú"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {formMode === 'create' ? 'Thêm' : 'Cập nhật'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && customerToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                    <p className="text-gray-600">Bạn có chắc chắn muốn xóa khách hàng này?</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{customerToDelete.name}</p>
                      <p className="text-sm text-gray-600">{customerToDelete.phone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(customerToDelete.type)}`}>
                      {getTypeLabel(customerToDelete.type)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <div className="space-x-4">
            <a href="/customer-test" className="text-blue-600 hover:underline">
              → Customer Test Page
            </a>
            <a href="/customers" className="text-blue-600 hover:underline">
              → Full Customers Page
            </a>
            <a href="/" className="text-blue-600 hover:underline">
              → Trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersSimple;
