
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User as UserType, UserLocation, Team } from '@/types/user';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Users, User, Lock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarText } from '@/components/login/LoginUtils';
import { motion } from 'framer-motion';
import LocationSelector from './LocationSelector';

interface LoginFormProps {
  departmentType?: string | null;
}

const LoginForm = ({ departmentType }: LoginFormProps) => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('123'); // Đặt mật khẩu mặc định là "123"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    login,
    users,
    teams
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Lọc người dùng theo vai trò, vị trí và phòng ban (nếu được chọn)
  const filteredUsers = users.filter(user => {
    // Nếu đã chọn phòng ban, lọc theo phòng ban
    if (departmentType) {
      if (departmentType === 'project' && user.department !== 'project') {
        return false;
      }
      if (departmentType === 'retail' && user.department !== 'retail') {
        return false;
      }
    }
    
    // Nếu chọn "Toàn Quốc" (hoặc các tên mới), chỉ hiển thị người dùng có vai trò đặc biệt
    if (selectedLocation === 'all') {
      if (departmentType === 'project') {
        return user.name === 'Hà Xuân Trường';
      } else if (departmentType === 'retail') {
        return user.name === 'Khổng Đức Mạnh';
      }
      return user.role === 'director';
    }

    // Nếu chọn khu vực cụ thể, hiển thị tất cả người dùng thuộc khu vực đó
    if (selectedTeam) {
      return user.team_id === selectedTeam.id;
    }
    return user.location === selectedLocation;
  });

  // Lọc teams dựa trên location
  const filteredTeams = teams.filter(team => {
    if (selectedLocation === 'all') {
      // Không hiển thị teams khi chọn "Hà Xuân Trường" hoặc "Khổng Đức Mạnh"
      return false;
    }
    return team.location === selectedLocation;
  });
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) {
      toast({
        title: 'Lỗi đăng nhập',
        description: 'Vui lòng chọn người dùng',
        variant: 'destructive'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(selectedUser.email, password);
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay trở lại!'
      });
      // Sử dụng setTimeout để đảm bảo state đã được cập nhật trước khi chuyển hướng
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error) {
      // Lỗi đã được xử lý trong hàm login
      setIsSubmitting(false);
    }
  };

  // Xác định xem có hiển thị mục chọn nhóm không
  const showTeamSelector = selectedLocation !== 'all';

  // Xác định xem có hiển thị mục chọn người dùng không
  const showUserSelector = selectedLocation === 'all' || selectedTeam;

  // Xác định xem có hiển thị người dùng đặc biệt không (Hà Xuân Trường hoặc Khổng Đức Mạnh)
  const isSpecialRole = selectedLocation === 'all';
  
  // Tự động chọn người dùng đặc biệt khi chọn "Toàn quốc"
  useEffect(() => {
    if (isSpecialRole && filteredUsers.length > 0 && !selectedUser) {
      setSelectedUser(filteredUsers[0]);
    }
  }, [isSpecialRole, filteredUsers, selectedUser]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* Chọn khu vực */}
        <LocationSelector
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          departmentType={departmentType}
        />

        {/* Team - Chỉ hiển thị khi chọn khu vực cụ thể */}
        {showTeamSelector && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="text-sm font-medium flex items-center text-[#636e72] mb-1">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              <span>Nhóm làm việc</span>
            </div>
            
            <Select 
              value={selectedTeam?.id || ''}
              onValueChange={(value) => {
                const team = teams.find(t => t.id === value);
                setSelectedTeam(team || null);
                setSelectedUser(null);
              }}
            >
              <SelectTrigger 
                className="h-10 bg-white/80 rounded-lg border border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 text-sm"
              >
                <div className="flex items-center">
                  <SelectValue placeholder="Chọn nhóm làm việc" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 rounded-lg p-1 border-[#dfe6e9]">
                {filteredTeams.map(team => (
                  <SelectItem key={team.id} value={team.id} className="py-1.5 text-sm">
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}

        {/* Người dùng - Đối với người dùng đặc biệt, tự động chọn người dùng */}
        {showUserSelector && !isSpecialRole && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="text-sm font-medium flex items-center text-[#636e72] mb-1">
              <User className="h-3.5 w-3.5 mr-1.5" />
              <span>Người dùng</span>
            </div>
            
            <Select 
              value={selectedUser?.id || ''}
              onValueChange={(value) => {
                const user = users.find(u => u.id === value);
                setSelectedUser(user || null);
              }}
            >
              <SelectTrigger 
                className="h-10 bg-white/80 rounded-lg border border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 text-sm"
              >
                <div className="flex items-center">
                  <SelectValue placeholder="Chọn người dùng" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 rounded-lg p-1 border-[#dfe6e9]">
                {filteredUsers.map(user => (
                  <SelectItem key={user.id} value={user.id} className="py-1.5 text-sm">
                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarFallback className={`text-white text-xs ${
                          user.role === 'director' 
                            ? 'bg-purple-500' 
                            : user.role === 'team_leader' 
                              ? 'bg-ios-blue' 
                              : 'bg-gray-500'
                        }`}>
                          {getAvatarText(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}

        {/* Không hiển thị danh sách trùng lặp cho người dùng đặc biệt */}

        {/* Mật khẩu */}
        <div className="relative mt-1">
          <div className="text-sm font-medium flex items-center text-[#636e72] mb-1.5">
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            <span>Mật khẩu</span>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-10 bg-white/90 rounded-lg border border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 text-sm"
            placeholder="Nhập mật khẩu"
            autoFocus
          />
        </div>
      </div>

      {/* Nút đăng nhập */}
      <motion.button
        type="submit"
        className="w-full py-3 mt-2 bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] text-white font-semibold text-sm rounded-lg relative overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#6c5ce7]/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isSubmitting || !selectedUser || !password}
        whileHover={{ scale: isSubmitting || !selectedUser || !password ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting || !selectedUser || !password ? 1 : 0.98 }}
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            Đang đăng nhập...
          </>
        ) : (
          'Đăng Nhập'
        )}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:animate-shimmer"></span>
      </motion.button>
    </form>
  );
};

export default LoginForm;
