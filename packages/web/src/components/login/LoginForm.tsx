import { motion } from 'framer-motion';
import { Lock, MapPin, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAvatarText } from '@/components/login/LoginUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContextSupabase';
import { useToast } from '@/hooks/use-toast';
import { Team, UserLocation, User as UserType } from '@/types/user';
import { getTeamNameWithLeader } from '@/utils/teamUtils';

// ChangePasswordModal removed - using GlobalPasswordChangeModal instead
import GoogleLoginButton from './GoogleLoginButton';
import LocationSelector from './LocationSelector';

interface LoginFormProps {
  departmentType?: string | null;
}

const LoginForm = ({ departmentType }: LoginFormProps) => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState(''); // Không đặt mật khẩu mặc định vì lý do bảo mật
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed showChangePassword and pendingUser - using GlobalPasswordChangeModal instead
  const { login, users, teams, isFirstLogin, changePassword, currentUser, requirePasswordChange } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Lọc teams dựa trên location và phòng ban TRƯỚC
  const filteredTeams = teams.filter((team) => {
    // Lọc theo phòng ban
    if (departmentType && team.department_type !== departmentType) {
      return false;
    }

    // Không hiển thị teams khi chọn "Hà Xuân Trường" hoặc "Khổng Đức Mạnh"
    if (selectedLocation === 'all') {
      return false;
    }

    // Lọc theo khu vực với mapping (support cả Firebase và Mock data format)
    const locationMatch =
      (selectedLocation === 'hanoi' && (
        team.location === 'Hà Nội' ||
        team.location === 'hanoi' ||
        team.location === 'Ha Noi'
      )) ||
      (selectedLocation === 'hcm' && (
        team.location === 'Hồ Chí Minh' ||
        team.location === 'hcm' ||
        team.location === 'Ho Chi Minh'
      )) ||
      team.location === selectedLocation;
    return locationMatch;
  });

  // Lọc người dùng theo phòng ban, vị trí và nhóm
  const filteredUsers = users.filter((user) => {
    console.log('🔍 FILTER DEBUG - selectedLocation:', selectedLocation, 'user:', user.name, 'role:', user.role);
    // ĐẢM BẢO TRƯỚC TIÊN LỌC THEO PHÒNG BAN
    // Chỉ hiển thị người dùng của phòng được chọn
    if (departmentType === 'project' && user.department_type !== 'project') {
      return false;
    }
    if (departmentType === 'retail' && user.department_type !== 'retail') {
      return false;
    }

    // Khi chọn "Khổng Đức Mạnh" - chỉ hiển thị Khổng Đức Mạnh (retail_director)
    if (selectedLocation === 'all') {
      console.log('🔍 KHỔNG ĐỨC MẠNH FILTER - User:', user.name, 'Role:', user.role, 'Match:', user.role === 'retail_director');
      // Chỉ hiển thị Khổng Đức Mạnh (retail_director)
      return user.role === 'retail_director';
    }

    // Khi chọn nhóm cụ thể
    if (selectedTeam) {
      // Chỉ hiển thị người dùng thuộc nhóm được chọn
      const locationMatch =
        (selectedLocation === 'hanoi' && (
          user.location === 'Hà Nội' ||
          user.location === 'hanoi' ||
          user.location === 'Ha Noi'
        )) ||
        (selectedLocation === 'hcm' && (
          user.location === 'Hồ Chí Minh' ||
          user.location === 'hcm' ||
          user.location === 'Ho Chi Minh'
        )) ||
        user.location === selectedLocation;
      return user.team_id === selectedTeam.id && locationMatch;
    }

    // Lọc theo khu vực (hiển thị tất cả người dùng trong khu vực khi không chọn nhóm cụ thể)
    const locationMatch =
      (selectedLocation === 'hanoi' && (
        user.location === 'Hà Nội' ||
        user.location === 'hanoi' ||
        user.location === 'Ha Noi'
      )) ||
      (selectedLocation === 'hcm' && (
        user.location === 'Hồ Chí Minh' ||
        user.location === 'hcm' ||
        user.location === 'Ho Chi Minh'
      )) ||
      user.location === selectedLocation;

    // If no departmentType selected, show all users for the location
    if (!departmentType) {
      return locationMatch;
    }

    return locationMatch && user.department_type === departmentType;
  });

  // Debug logging - Enhanced for Supabase
  console.log('🔍 LoginForm Debug - Supabase Data:', {
    selectedLocation,
    selectedTeam,
    departmentType,
    totalUsers: users.length,
    totalTeams: teams.length,
    filteredUsers: filteredUsers.length,
    filteredTeams: filteredTeams.length,
    usersLoadedFromSupabase: users.length > 0 ? 'YES' : 'NO',
    teamsLoadedFromSupabase: teams.length > 0 ? 'YES' : 'NO',
    filteredUsersData: filteredUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      team_id: u.team_id,
      location: u.location,
      department_type: u.department_type,
      position: u.position,
    })),
    filteredTeamsData: filteredTeams.map((t) => ({
      id: t.id,
      name: t.name,
      location: t.location,
      department_type: t.department_type,
    })),
    allUsersData: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      team_id: u.team_id,
      location: u.location,
      department_type: u.department_type,
      position: u.position,
    })),
    allTeamsData: teams.map((t) => ({
      id: t.id,
      name: t.name,
      location: t.location,
      department_type: t.department_type,
    })),
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Debug logging - Enhanced for authentication
    console.log('🔐 LoginForm Submit Debug:', {
      selectedLocation,
      selectedTeam,
      departmentType,
      totalUsers: users.length,
      filteredUsers: filteredUsers.length,
      selectedUser: selectedUser ? {
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        position: selectedUser.position,
        department_type: selectedUser.department_type,
        location: selectedUser.location
      } : null,
      password: password ? '***' : 'empty',
      authenticationMethod: 'email'
    });

    if (!selectedUser) {
      toast({
        title: 'Lỗi đăng nhập',
        description: 'Vui lòng chọn người dùng',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedUser.email) {
      toast({
        title: 'Lỗi đăng nhập',
        description: 'Người dùng không có email. Vui lòng liên hệ quản trị viên.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🚀 Attempting login with email:', selectedUser.email, 'for user:', selectedUser.name);
      await login(selectedUser.email, password);

      // Password change modal will be handled by GlobalPasswordChangeModal
      // No need to handle first login here anymore

      // Don't show success toast or navigate immediately - let GlobalPasswordChangeModal handle it
      console.log('✅ Login successful - GlobalPasswordChangeModal will handle password change if needed');

      // Reset submitting state after a short delay to allow auth state to update
      setTimeout(() => {
        setIsSubmitting(false);

        // Only navigate if no password change is required
        // This will be determined by the auth context and GlobalPasswordChangeModal
        if (!requirePasswordChange && !isFirstLogin) {
          // Removed success login toast - navigate silently
          navigate('/');
        }
      }, 500);
    } catch (error) {
      // Lỗi đã được xử lý trong hàm login
      setIsSubmitting(false);
      // Clear password để user có thể nhập lại, nhưng giữ nguyên location/user selection
      setPassword('');
    }
  };

  // Xác định xem có hiển thị mục chọn nhóm không
  const showTeamSelector = selectedLocation !== 'all';

  // Xác định xem có hiển thị mục chọn người dùng không
  // Luôn hiển thị người dùng sau khi chọn khu vực
  const showUserSelector = true;

  // Xác định xem có hiển thị người dùng đặc biệt không (Hà Xuân Trường hoặc Khổng Đức Mạnh)
  const isSpecialRole = selectedLocation === 'all';

  // Password change handlers removed - using GlobalPasswordChangeModal instead

  // Reset team và user khi thay đổi khu vực
  useEffect(() => {
    setSelectedTeam(null);
    setSelectedUser(null);
  }, [selectedLocation]);

  // Reset user khi thay đổi team
  useEffect(() => {
    setSelectedUser(null);
  }, [selectedTeam]);

  // Tự động chọn người dùng đặc biệt khi chọn "Khổng Đức Mạnh"
  useEffect(() => {
    if (isSpecialRole && filteredUsers.length > 0 && !selectedUser) {
      setSelectedUser(filteredUsers[0]);
    }
  }, [isSpecialRole, filteredUsers, selectedUser]);

  // Password change modal handling removed - using GlobalPasswordChangeModal instead

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
                <option value="">Chọn nhóm làm việc</option>
                {filteredTeams
                  .filter((team) => team && team.id && team.name) // Lọc dữ liệu hợp lệ
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {getTeamNameWithLeader(team.id, teams, users)}
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
                data-testid="user-selector"
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
              data-testid="password-input"
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

        {/* Nút đăng nhập - FIXED ANIMATION */}
        <motion.button
          type="submit"
          data-testid="login-submit-button"
          className="w-full py-3 mt-6 bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] text-white font-semibold text-sm rounded-lg relative overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#6c5ce7]/40 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={isSubmitting || !selectedUser || !password}
          whileHover={{
            scale: isSubmitting || !selectedUser || !password ? 1 : 1.01,
            y: isSubmitting || !selectedUser || !password ? 0 : -2
          }}
          whileTap={{
            scale: isSubmitting || !selectedUser || !password ? 1 : 0.99,
            y: isSubmitting || !selectedUser || !password ? 0 : 0
          }}
          transition={{ duration: 0.1, ease: "easeInOut" }}
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

      {/*
        Modal đổi mật khẩu đã được chuyển sang GlobalPasswordChangeModal
        để tránh duplicate rendering và handle globally across all pages
      */}
    </div>
  );
};

export default LoginForm;
