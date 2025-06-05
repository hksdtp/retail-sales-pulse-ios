
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User as UserType, UserLocation, Team } from '@/types/user';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Users, User, Lock } from 'lucide-react';
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

  // Lọc người dùng theo phòng ban, vị trí và nhóm
  const filteredUsers = users.filter(user => {
    // ĐẢM BẢO TRƯỚC TIÊN LỌC THEO PHÒNG BAN
    // Chỉ hiển thị người dùng của phòng được chọn
    if (departmentType === 'project' && user.department_type !== 'project') {
      return false;
    }
    if (departmentType === 'retail' && user.department_type !== 'retail') {
      return false;
    }
    
    // Khi chọn "Toàn Quốc" (hoặc "Khổng Đức Mạnh" hoặc "Hà Xuân Trường")
    if (selectedLocation === 'all') {
      if (departmentType === 'project') {
        // Chỉ hiển thị Trưởng phòng Dự án
        return user.role === 'project_director';
      } else if (departmentType === 'retail') {
        // Chỉ hiển thị Trưởng phòng Bán lẻ
        return user.role === 'retail_director';
      }
      // Nếu không chọn phòng ban, hiển thị cả hai trưởng phòng
      return user.role === 'retail_director' || user.role === 'project_director';
    }

    // Khi chọn nhóm cụ thể
    if (selectedTeam) {
      // Chỉ hiển thị người dùng thuộc nhóm được chọn
      return user.team_id === selectedTeam.id;
    }

    // Lọc theo khu vực (hiển thị tất cả người dùng trong khu vực khi không chọn nhóm cụ thể)
    return user.location === selectedLocation && user.department_type === departmentType;
  });

  // Lọc teams dựa trên location và phòng ban
  const filteredTeams = teams.filter(team => {
    // Lọc theo phòng ban
    if (departmentType && team.department_type !== departmentType) {
      return false;
    }
    
    // Không hiển thị teams khi chọn "Hà Xuân Trường" hoặc "Khổng Đức Mạnh"
    if (selectedLocation === 'all') {
      return false;
    }
    
    // Lọc theo khu vực
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
  // Luôn hiển thị người dùng sau khi chọn khu vực
  const showUserSelector = true;

  // Xác định xem có hiển thị người dùng đặc biệt không (Hà Xuân Trường hoặc Khổng Đức Mạnh)
  const isSpecialRole = selectedLocation === 'all';
  
  // Reset team và user khi thay đổi khu vực
  useEffect(() => {
    setSelectedTeam(null);
    setSelectedUser(null);
  }, [selectedLocation]);

  // Tự động chọn người dùng đặc biệt khi chọn "Toàn quốc"
  useEffect(() => {
    if (isSpecialRole && filteredUsers.length > 0 && !selectedUser) {
      setSelectedUser(filteredUsers[0]);
    }
  }, [isSpecialRole, filteredUsers, selectedUser]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4 min-h-[280px] relative">
        {/* Chọn khu vực */}
        <LocationSelector
          selectedLocation={selectedLocation}
          onLocationChange={(location) => {
            setSelectedLocation(location);
            // Reset sẽ được xử lý bởi useEffect
          }}
          departmentType={departmentType}
        />

        {/* Team - Chỉ hiển thị khi chọn khu vực cụ thể */}
        {showTeamSelector && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 form-field-container"
          >
            <div className="text-sm font-medium flex items-center text-[#636e72] mb-1">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              <span>Nhóm làm việc (tùy chọn)</span>
            </div>

            <select
              value={selectedTeam?.id || ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  setSelectedTeam(null);
                } else {
                  const team = teams.find(t => t.id === e.target.value);
                  setSelectedTeam(team || null);
                }
                setSelectedUser(null);
              }}
              className="w-full h-10 bg-white/80 rounded-lg border border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 text-sm px-3"
            >
              <option value="">Tất cả nhóm</option>
              {filteredTeams
                .filter(team => team && team.id && team.name) // Lọc dữ liệu hợp lệ
                .map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name || 'Không có tên nhóm'}
                  </option>
                ))}
            </select>
          </motion.div>
        )}

        {/* Người dùng - Đối với người dùng đặc biệt, tự động chọn người dùng */}
        {showUserSelector && !isSpecialRole && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 form-field-container"
          >
            <div className="text-sm font-medium flex items-center text-[#636e72] mb-1">
              <User className="h-3.5 w-3.5 mr-1.5" />
              <span>Người dùng</span>
            </div>

            <select
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = users.find(u => u.id === e.target.value);
                setSelectedUser(user || null);
              }}
              className="w-full h-10 bg-white/80 rounded-lg border border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 text-sm px-3"
            >
              <option value="">Chọn người dùng</option>
              {filteredUsers
                .filter(user => user && user.id && user.name) // Lọc dữ liệu hợp lệ
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || 'Không có tên'}
                  </option>
                ))}
            </select>
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
