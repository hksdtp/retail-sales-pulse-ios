import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const CustomersSimple: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      status: 'active'
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
      status: 'active'
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
      status: 'active'
    }
  ];

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    setError(null);
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock data for now
      setCustomers(mockCustomers);
      console.log('✅ Loaded mock customers:', mockCustomers.length);
    } catch (err) {
      setError('Không thể tải danh sách khách hàng');
      console.error('❌ Error loading customers:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧑‍💼 Quản lý khách hàng
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin khách hàng, kiến trúc sư và đối tác
          </p>
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
                        <div className="space-x-2">
                          <button className="text-blue-600 hover:underline text-sm">Sửa</button>
                          <button className="text-red-600 hover:underline text-sm">Xóa</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
