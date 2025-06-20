import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { LocalStorageSyncPanel } from '@/components/sync/LocalStorageSyncPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Settings as SettingsIcon, Database, User, Bell, Shield } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <AppLayout>
      <PageHeader
        title="Cài đặt"
        subtitle="Quản lý cấu hình hệ thống và đồng bộ dữ liệu"
        actions={
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              Người dùng: {currentUser?.name}
            </span>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="sync" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Đồng bộ dữ liệu
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Hồ sơ
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Thông báo
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Bảo mật
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sync" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Đồng bộ dữ liệu LocalStorage → Firebase</CardTitle>
                  <CardDescription>
                    Đồng bộ các công việc đã nhập từ trình duyệt lên Firebase để chia sẻ với toàn bộ người dùng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LocalStorageSyncPanel />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hướng dẫn sử dụng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-medium">📝 Nhập dữ liệu:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Nhập tasks trực tiếp trên web app</li>
                        <li>• Dữ liệu được lưu tự động trong trình duyệt</li>
                        <li>• Có thể làm việc offline</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">🔄 Đồng bộ:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Nhấn "Đồng bộ tất cả" để upload lên Firebase</li>
                        <li>• Dữ liệu sẽ có sẵn cho tất cả người dùng</li>
                        <li>• Có thể theo dõi tiến trình đồng bộ</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">🧹 Dọn dẹp:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Xóa dữ liệu đã đồng bộ khỏi localStorage</li>
                        <li>• Giải phóng dung lượng trình duyệt</li>
                        <li>• Dữ liệu vẫn an toàn trên Firebase</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">⚠️ Lưu ý:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Backup dữ liệu trước khi xóa</li>
                        <li>• Kiểm tra kết nối Firebase</li>
                        <li>• Đồng bộ thường xuyên để tránh mất dữ liệu</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin hồ sơ</CardTitle>
                <CardDescription>
                  Quản lý thông tin cá nhân và cài đặt tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Tên:</label>
                      <p className="text-gray-600">{currentUser?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email:</label>
                      <p className="text-gray-600">{currentUser?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Vai trò:</label>
                      <p className="text-gray-600">{currentUser?.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Địa điểm:</label>
                      <p className="text-gray-600">{currentUser?.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
                <CardDescription>
                  Quản lý các loại thông báo và cảnh báo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Tính năng đang phát triển...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt bảo mật</CardTitle>
                <CardDescription>
                  Quản lý mật khẩu và cài đặt bảo mật tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Tính năng đang phát triển...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
