import { motion } from 'framer-motion';
import { Lock, MapPin, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAvatarText } from '@/components/login/LoginUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Team, UserLocation, User as UserType } from '@/types/user';

import ChangePasswordModal from './ChangePasswordModal';
import GoogleLoginButton from './GoogleLoginButton';
import LocationSelector from './LocationSelector';

interface LoginFormProps {
  departmentType?: string | null;
}

const LoginForm = ({ departmentType }: LoginFormProps) => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('123456'); // Đặt mật khẩu mặc định là "123456"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserType | null>(null);
  const { login, users, teams, isFirstLogin, changePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Lọc người dùng theo phòng ban, vị trí và nhóm
  const filteredUsers = users.filter((user) => {
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
      const locationMatch =
        (selectedLocation === 'hanoi' && (user.location === 'Hà Nội' || user.location === 'hanoi')) ||
        (selectedLocation === 'hcm' && (user.location === 'Hồ Chí Minh' || user.location === 'hcm')) ||
        user.location === selectedLocation;
      return user.team_id === selectedTeam.id && locationMatch;
    }

    // Lọc theo khu vực (hiển thị tất cả người dùng trong khu vực khi không chọn nhóm cụ thể)
    const locationMatch =
      (selectedLocation === 'hanoi' && (user.location === 'Hà Nội' || user.location === 'hanoi')) ||
      (selectedLocation === 'hcm' && (user.location === 'Hồ Chí Minh' || user.location === 'hcm')) ||
      user.location === selectedLocation;
    return locationMatch && user.department_type === departmentType;
  });

  // Debug logging
  console.log('LoginForm Debug:', {
    selectedLocation,
    selectedTeam,
    departmentType,
    totalUsers: users.length,
    totalTeams: teams.length,
    filteredUsers: filteredUsers.length,
    filteredTeams: filteredTeams.length,
    filteredUsersData: filteredUsers.map((u) => ({
      id: u.id,
      name: u.name,
      team_id: u.team_id,
      location: u.location,
    })),
    filteredTeamsData: filteredTeams.map((t) => ({
      id: t.id,
      name: t.name,
      location: t.location,
    })),
    allUsersData: users.map((u) => ({
      id: u.id,
      name: u.name,
      team_id: u.team_id,
      location: u.location,
      department_type: u.department_type,
    })),
    allTeamsData: teams.map((t) => ({
      id: t.id,
      name: t.name,
      location: t.location,
      department_type: t.department_type,
    })),
  });

  // Lọc teams dựa trên location và phòng ban
  const filteredTeams = teams.filter((team) => {
    // Lọc theo phòng ban
    if (departmentType && team.department_type !== departmentType) {
      return false;
    }

    // Không hiển thị teams khi chọn "Hà Xuân Trường" hoặc "Khổng Đức Mạnh"
    if (selectedLocation === 'all') {
      return false;
    }

    // Lọc theo khu vực với mapping
    const locationMatch =
      (selectedLocation === 'hanoi' && (team.location === 'Hà Nội' || team.location === 'hanoi')) ||
      (selectedLocation === 'hcm' && (team.location === 'Hồ Chí Minh' || team.location === 'hcm')) ||
      team.location === selectedLocation;
    return locationMatch;
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Debug logging
    console.log('LoginForm Debug:', {
      selectedLocation,
      selectedTeam,
      departmentType,
      totalUsers: users.length,
      filteredUsers: filteredUsers.length,
      selectedUser,
      password: password ? '***' : 'empty'
    });

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
      console.log('Attempting login with email:', selectedUser.email);
      await login(selectedUser.email, password);

      // Kiểm tra xem có phải lần đăng nhập đầu tiên không
      if (isFirstLogin) {
        setPendingUser(selectedUser);
        setShowChangePassword(true);
        setIsSubmitting(false);
        return;
      }

      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay trở lại!',
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

  // Handlers cho modal đổi mật khẩu
  const handlePasswordChange = (newPassword: string) => {
    changePassword(newPassword);
    setShowChangePassword(false);
    setPendingUser(null);

    toast({
      title: 'Đăng nhập thành công',
      description: 'Chào mừng bạn đến với hệ thống!',
    });

    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  const handleCancelPasswordChange = () => {
    setShowChangePassword(false);
    setPendingUser(null);
    // Logout user nếu họ hủy đổi mật khẩu
    // logout();
  };

  // Reset team và user khi thay đổi khu vực
  useEffect(() => {
    setSelectedTeam(null);
    setSelectedUser(null);
  }, [selectedLocation]);

  // Reset user khi thay đổi team
  useEffect(() => {
    setSelectedUser(null);
  }, [selectedTeam]);

  // Tự động chọn người dùng đặc biệt khi chọn "Toàn quốc"
  useEffect(() => {
    if (isSpecialRole && filteredUsers.length > 0 && !selectedUser) {
      setSelectedUser(filteredUsers[0]);
    }
  }, [isSpecialRole, filteredUsers, selectedUser]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 min-h-[240px] relative">
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
                    const team = teams.find((t) => t.id === e.target.value);
                    setSelectedTeam(team || null);
                  }
                }}
                className="w-full h-10 bg-white/80 rounded-lg border border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 text-sm px-3"
              >
                <option value="">Tất cả nhóm</option>
                {filteredTeams
                  .filter((team) => team && team.id && team.name) // Lọc dữ liệu hợp lệ
                  .map((team) => (
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
                  const user = users.find((u) => u.id === e.target.value);
                  setSelectedUser(user || null);
                }}
                className="w-full h-10 bg-white/80 rounded-lg border border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 text-sm px-3"
              >
                <option value="">Chọn người dùng</option>
                {filteredUsers
                  .filter((user) => user && user.id && user.name) // Lọc dữ liệu hợp lệ
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
          <div className="relative">
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
          className="w-full py-3 mt-6 bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] text-white font-semibold text-sm rounded-lg relative overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#6c5ce7]/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
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

      {/* Tạm ẩn Google Login */}
      {/*
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex items-center my-6"
      >
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-sm text-gray-500 bg-white">hoặc</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </motion.div>

      <GoogleLoginButton disabled={isSubmitting} />
      */}

      {/* Modal đổi mật khẩu lần đầu */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        userName={pendingUser?.name || ''}
        onPasswordChange={handlePasswordChange}
        onCancel={handleCancelPasswordChange}
      />
    </div>
  );
};

export default LoginForm;
