
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/login/LoginForm';

const Login = () => {
  return <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-ios-gray to-white overflow-hidden">
      <div className="w-full max-w-md mx-auto min-h-[600px] flex items-center px-[10px] py-[20px] relative">
        <Card className="w-full shadow-lg border-0 rounded-xl overflow-hidden backdrop-blur-md bg-white/90">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold">Đăng nhập</CardTitle>
            <p className="text-sm md:text-base text-gray-500 mt-2">
              Chọn người dùng và nhập mật khẩu để tiếp tục
            </p>
          </CardHeader>

          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>;
};

export default Login;
