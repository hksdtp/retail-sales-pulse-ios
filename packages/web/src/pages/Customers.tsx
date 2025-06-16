import React from 'react';
import { CustomerList } from '@/components/customers/CustomerList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, UserCheck, Building } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/services/CustomerService';

const Customers: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Get permissions for current user
  const permissions = currentUser ? customerService.getCustomerPermissions(currentUser) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Quản lý khách hàng
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý thông tin khách hàng, kiến trúc sư và đối tác
            </p>
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
        <CustomerList />

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Hướng dẫn sử dụng</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <strong>Khách hàng:</strong> Khách hàng cuối sử dụng sản phẩm</p>
                  <p>• <strong>Kiến trúc sư:</strong> Các kiến trúc sư thiết kế dự án</p>
                  <p>• <strong>Đối tác:</strong> Các đối tác kinh doanh, nhà phân phối</p>
                  <p>• Mỗi khách hàng sẽ được gán cho một nhân viên sale phụ trách</p>
                  <p>• Dữ liệu sẽ được tự động sao lưu vào Google Sheets của từng nhân viên</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Customers;
