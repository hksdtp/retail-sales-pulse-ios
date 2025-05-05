
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Email hoặc mật khẩu không chính xác',
        variant: 'destructive',
      });
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
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
            <p>Mẫu đăng nhập:</p>
            <p>Email: director@example.com (Giám đốc)</p>
            <p>Email: leader_hn1@example.com (Trưởng nhóm HN)</p>
            <p>Email: employee_hn1@example.com (Nhân viên HN)</p>
            <p>Mật khẩu: Nhập bất kỳ</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
