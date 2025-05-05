
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserLocation } from '@/types/user';

const Login = () => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const { login, users } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Lọc người dùng theo khu vực
  useEffect(() => {
    if (selectedLocation === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.location === selectedLocation));
    }
  }, [selectedLocation, users]);

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

  const getAvatarText = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const locationNames = {
    all: 'Toàn quốc',
    hanoi: 'Hà Nội',
    hcm: 'Hồ Chí Minh'
  };

  const positionLabels: Record<string, string> = {
    director: 'Giám đốc Kinh doanh',
    team_leader: 'Trưởng nhóm',
    employee: 'Nhân viên'
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ios-gray p-4">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Đăng nhập</CardTitle>
          <CardDescription className="text-base">
            Chọn người dùng và nhập mật khẩu để tiếp tục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-lg font-medium">
                  Khu vực
                </label>
                <Select 
                  value={selectedLocation} 
                  onValueChange={(value: UserLocation | 'all') => {
                    setSelectedLocation(value);
                    setSelectedUser(null);
                  }}
                >
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue placeholder="Chọn khu vực">
                      {locationNames[selectedLocation]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-base py-2">Toàn quốc</SelectItem>
                    <SelectItem value="hanoi" className="text-base py-2">Hà Nội</SelectItem>
                    <SelectItem value="hcm" className="text-base py-2">Hồ Chí Minh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium">
                  Chọn người dùng của bạn
                </label>
                {selectedUser ? (
                  <div 
                    className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedUser(null)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback className="bg-ios-blue text-white">
                        {getAvatarText(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-lg">{selectedUser.name}</span>
                      <span className="text-gray-500">{selectedUser.position || positionLabels[selectedUser.role]}</span>
                    </div>
                    <ChevronDown className="ml-auto" />
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-ios-blue text-white">
                            {getAvatarText(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-gray-500">{user.position || positionLabels[user.role]}</span>
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Không tìm thấy người dùng trong khu vực này
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-lg font-medium">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10 h-12 text-base"
                    placeholder="Nhập mật khẩu"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium bg-ios-blue"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-center text-ios-blue hover:underline cursor-pointer">
            Chưa có tài khoản? Đăng ký ngay
          </p>
        </CardFooter>
        <div className="px-6 pb-6">
          <div className="text-center text-xs text-muted-foreground">
            <p>Mật khẩu mặc định: password123</p>
            <p className="mt-1 font-medium">Lần đầu đăng nhập sẽ yêu cầu đổi mật khẩu</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
