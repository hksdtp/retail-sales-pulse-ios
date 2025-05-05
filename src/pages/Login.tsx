
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { User as UserType, UserLocation, Team } from '@/types/user';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

const Login = () => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>("all");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSelectionMode, setUserSelectionMode] = useState<'location' | 'direct'>('location');
  const { login, users } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast({
        title: 'Lỗi đăng nhập',
        description: 'Vui lòng chọn người dùng',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(selectedUser.email, password);
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-md border rounded-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Đăng nhập</CardTitle>
            <CardDescription className="text-base pb-4">
              Chọn người dùng và nhập mật khẩu để tiếp tục
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-base font-medium">Khu vực</label>
                  <Select 
                    value={selectedLocation} 
                    onValueChange={(value: UserLocation | 'all') => setSelectedLocation(value)}
                  >
                    <SelectTrigger className="w-full h-12 text-base bg-gray-100 border-0">
                      <SelectValue placeholder="Chọn khu vực" />
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toàn quốc</SelectItem>
                      <SelectItem value="hanoi">Hà Nội</SelectItem>
                      <SelectItem value="hcm">Hồ Chí Minh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-base font-medium">Hoặc chọn người dùng trực tiếp</label>
                  <Select 
                    onValueChange={(userId) => {
                      const user = users.find(u => u.id === userId);
                      if (user) setSelectedUser(user);
                    }}
                  >
                    <SelectTrigger className="w-full h-12 text-base bg-gray-100 border-0">
                      <SelectValue placeholder="Chọn người dùng" />
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser && (
                  <div className="space-y-2">
                    <label className="text-base font-medium">Mật khẩu</label>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base bg-gray-100 border-0"
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-center text-blue-500 hover:underline cursor-pointer">
              Chưa có tài khoản? Đăng ký ngay
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
