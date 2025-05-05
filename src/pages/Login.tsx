
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay trở lại!',
      });
      navigate('/');
    } catch (error) {
      // Lỗi đã được xử lý trong hàm login
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ios-gray p-4">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-ios-blue">RetailSalesPulse</CardTitle>
          <CardDescription>
            Đăng nhập để truy cập hệ thống quản lý
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
                <button type="button" className="text-xs text-ios-blue hover:underline">
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-xs text-muted-foreground mt-4">
            <p>Danh sách tài khoản mẫu:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div className="text-left">
                <p className="font-semibold">Giám đốc:</p>
                <p>director@example.com</p>
              </div>
              <div className="text-left">
                <p className="font-semibold">Trưởng nhóm Hà Nội:</p>
                <p>leader_hn1@example.com</p>
                <p>leader_hn2@example.com</p>
              </div>
              <div className="text-left">
                <p className="font-semibold">Trưởng nhóm HCM:</p>
                <p>leader_hcm1@example.com</p>
                <p>leader_hcm2@example.com</p>
              </div>
              <div className="text-left">
                <p className="font-semibold">Nhân viên Hà Nội:</p>
                <p>employee_hn1@example.com</p>
                <p>employee_hn2@example.com</p>
                <p>employee_hn3@example.com</p>
              </div>
              <div className="text-left">
                <p className="font-semibold">Nhân viên HCM:</p>
                <p>employee_hcm1@example.com</p>
                <p>employee_hcm2@example.com</p>
              </div>
            </div>
            <p className="mt-2">Mật khẩu mặc định: password123</p>
            <p className="mt-2 font-medium">Lần đầu đăng nhập sẽ yêu cầu đổi mật khẩu</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
