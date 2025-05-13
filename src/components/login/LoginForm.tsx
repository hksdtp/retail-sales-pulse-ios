
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User as UserType, UserLocation, Team } from '@/types/user';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Users, User, Lock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { locationNames, getAvatarText } from '@/components/login/LoginUtils';
import PasswordField from './PasswordField';
import { motion } from 'framer-motion';

const LoginForm = () => {
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

  // Lọc người dùng theo vai trò và vị trí
  const filteredUsers = users.filter(user => {
    // Nếu chọn "Toàn Quốc", chỉ hiển thị người dùng có vai trò "director"
    if (selectedLocation === 'all') {
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
      // Không hiển thị teams khi chọn "Toàn Quốc" vì người dùng sẽ chọn trực tiếp Giám đốc
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
      navigate('/');
    } catch (error) {
      // Lỗi đã được xử lý trong hàm login
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xác định xem có hiển thị mục chọn nhóm không
  const showTeamSelector = selectedLocation !== 'all';

  // Xác định xem có hiển thị mục chọn người dùng không
  const showUserSelector = selectedLocation === 'all' || selectedTeam;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="space-y-5">
        {/* Khu vực */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#636e72]">
            <MapPin className="h-5 w-5" />
          </div>
          <Select 
            value={selectedLocation} 
            onValueChange={(value: UserLocation | 'all') => {
              setSelectedLocation(value);
              setSelectedTeam(null);
              setSelectedUser(null);
            }}
          >
            <SelectTrigger className="w-full h-12 bg-white/90 pl-12 rounded-xl border-2 border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-4 focus:ring-[#6c5ce7]/20 focus:scale-[1.02]">
              <SelectValue placeholder="Chọn khu vực" />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              sideOffset={5} 
              className="max-h-60 bg-white z-[100] shadow-xl border border-gray-200" 
            >
              <SelectItem value="all" className="py-2 md:py-3">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-ios-blue flex items-center justify-center mr-2">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  Toàn quốc
                </div>
              </SelectItem>
              <SelectItem value="hanoi" className="py-2 md:py-3">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  Hà Nội
                </div>
              </SelectItem>
              <SelectItem value="hcm" className="py-2 md:py-3">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center mr-2">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  Hồ Chí Minh
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team - Chỉ hiển thị khi chọn khu vực cụ thể */}
        {showTeamSelector && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#636e72]">
              <Users className="h-5 w-5" />
            </div>
            <Select 
              value={selectedTeam?.id || ''} 
              onValueChange={teamId => {
                const team = teams.find(t => t.id === teamId);
                setSelectedTeam(team || null);
                setSelectedUser(null);
              }} 
              disabled={filteredTeams.length === 0}
            >
              <SelectTrigger className="w-full h-12 bg-white/90 pl-12 rounded-xl border-2 border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-4 focus:ring-[#6c5ce7]/20 focus:scale-[1.02]">
                <SelectValue placeholder="Chọn nhóm" />
              </SelectTrigger>
              <SelectContent 
                position="popper" 
                sideOffset={5}
                className="max-h-60 bg-white z-[100] shadow-xl border border-gray-200"
              >
                {filteredTeams.map(team => (
                  <SelectItem key={team.id} value={team.id} className="py-2 md:py-3">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-ios-blue flex items-center justify-center mr-2">
                        <Users className="h-3 w-3 text-white" />
                      </div>
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}

        {/* Người dùng */}
        {showUserSelector && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#636e72]">
              <User className="h-5 w-5" />
            </div>
            <Select 
              value={selectedUser?.id || ''} 
              onValueChange={userId => {
                const user = users.find(u => u.id === userId);
                setSelectedUser(user || null);
              }} 
              disabled={filteredUsers.length === 0}
            >
              <SelectTrigger className="w-full h-12 bg-white/90 pl-12 rounded-xl border-2 border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-4 focus:ring-[#6c5ce7]/20 focus:scale-[1.02]">
                <SelectValue placeholder="Chọn người dùng" />
              </SelectTrigger>
              <SelectContent 
                position="popper" 
                sideOffset={5}
                className="max-h-60 bg-white z-[100] shadow-xl border border-gray-200"
              >
                {filteredUsers.map(user => (
                  <SelectItem key={user.id} value={user.id} className="py-2 md:py-3">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className={`text-white ${
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

        {/* Mật khẩu */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#636e72]">
            <Lock className="h-5 w-5" />
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-12 pl-12 bg-white/90 rounded-xl border-2 border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-4 focus:ring-[#6c5ce7]/20 focus:scale-[1.02]"
            placeholder="Nhập mật khẩu"
            autoFocus
          />
        </div>
      </div>

      {/* Nút đăng nhập */}
      <motion.button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] text-white font-semibold text-base rounded-xl relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6c5ce7]/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isSubmitting || !selectedUser || !password}
        whileHover={{ scale: isSubmitting || !selectedUser || !password ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting || !selectedUser || !password ? 1 : 0.98 }}
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
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
