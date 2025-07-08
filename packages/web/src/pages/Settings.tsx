import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';

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
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
