
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType, UserLocation, Team } from '@/types/user';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Users, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { locationNames, getAvatarText } from '@/components/login/LoginUtils';

const Login = () => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('');
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
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-ios-gray to-white overflow-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md mx-auto px-4 py-6"
      >
        <Card className="shadow-lg border-0 rounded-xl overflow-hidden backdrop-blur-md bg-white/90">
          <CardHeader className="space-y-1 text-center">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <CardTitle className="text-2xl md:text-3xl font-bold">Đăng nhập</CardTitle>
              <p className="text-sm md:text-base text-gray-500 mt-2">
                Chọn người dùng và nhập mật khẩu để tiếp tục
              </p>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div 
                  key="login-form" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="space-y-4"
                >
                  {/* Khu vực */}
                  <div className="space-y-2">
                    <label className="text-sm md:text-base font-medium">
                      Khu vực
                    </label>
                    <Select 
                      value={selectedLocation} 
                      onValueChange={(value: UserLocation | 'all') => {
                        setSelectedLocation(value);
                        setSelectedTeam(null);
                        setSelectedUser(null);
                      }}
                    >
                      <SelectTrigger className="w-full h-10 md:h-12 bg-white/70 backdrop-blur-sm border border-gray-200">
                        <SelectValue placeholder="Chọn khu vực">
                          {locationNames[selectedLocation]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="all" className="py-2 md:py-3">
                          <div className="flex items-center">
                            <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-ios-blue flex items-center justify-center mr-2">
                              <MapPin className="h-3 w-3 text-white" />
                            </div>
                            Toàn quốc
                          </div>
                        </SelectItem>
                        <SelectItem value="hanoi" className="py-2 md:py-3">
                          <div className="flex items-center">
                            <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                              <MapPin className="h-3 w-3 text-white" />
                            </div>
                            Hà Nội
                          </div>
                        </SelectItem>
                        <SelectItem value="hcm" className="py-2 md:py-3">
                          <div className="flex items-center">
                            <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-orange-500 flex items-center justify-center mr-2">
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
                    <div className="space-y-2">
                      <label className="text-sm md:text-base font-medium">
                        Team
                      </label>
                      <Select 
                        value={selectedTeam?.id || ''} 
                        onValueChange={teamId => {
                          const team = teams.find(t => t.id === teamId);
                          setSelectedTeam(team || null);
                          setSelectedUser(null);
                        }} 
                        disabled={filteredTeams.length === 0}
                      >
                        <SelectTrigger className="w-full h-10 md:h-12 bg-white/70 backdrop-blur-sm border border-gray-200">
                          <SelectValue placeholder="Chọn nhóm">
                            {selectedTeam?.name || 'Chọn nhóm'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {filteredTeams.map(team => (
                            <SelectItem key={team.id} value={team.id} className="py-2 md:py-3">
                              <div className="flex items-center">
                                <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-ios-blue flex items-center justify-center mr-2">
                                  <Users className="h-3 w-3 text-white" />
                                </div>
                                {team.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Người dùng */}
                  {showUserSelector && (
                    <div className="space-y-2">
                      <label className="text-sm md:text-base font-medium">
                        Người dùng
                      </label>
                      <Select 
                        value={selectedUser?.id || ''} 
                        onValueChange={userId => {
                          const user = users.find(u => u.id === userId);
                          setSelectedUser(user || null);
                        }} 
                        disabled={filteredUsers.length === 0}
                      >
                        <SelectTrigger className="w-full h-10 md:h-12 bg-white/70 backdrop-blur-sm border border-gray-200">
                          <SelectValue placeholder="Chọn người dùng">
                            {selectedUser ? (
                              <div className="flex items-center">
                                <Avatar className="h-5 w-5 md:h-6 md:w-6 mr-2">
                                  <AvatarFallback className={`text-white ${
                                    selectedUser.role === 'director' 
                                      ? 'bg-purple-500' 
                                      : selectedUser.role === 'team_leader' 
                                        ? 'bg-ios-blue' 
                                        : 'bg-gray-500'
                                  }`}>
                                    {getAvatarText(selectedUser.name)}
                                  </AvatarFallback>
                                </Avatar>
                                {selectedUser.name}
                              </div>
                            ) : 'Chọn người dùng'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {filteredUsers.map(user => (
                            <SelectItem key={user.id} value={user.id} className="py-2 md:py-3">
                              <div className="flex items-center">
                                <Avatar className="h-5 w-5 md:h-6 md:w-6 mr-2">
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
                    </div>
                  )}

                  {/* Mật khẩu */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm md:text-base font-medium">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full h-10 md:h-12 bg-white/70 backdrop-blur-sm border border-gray-200" 
                        placeholder="Nhập mật khẩu" 
                        disabled={!selectedUser} 
                      />
                    </div>
                  </div>

                  {/* Nút đăng nhập */}
                  <motion.div 
                    whileHover={{ scale: selectedUser && password ? 1.02 : 1 }}
                    whileTap={{ scale: selectedUser && password ? 0.98 : 1 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-10 md:h-12 text-base md:text-lg font-medium bg-ios-blue mt-4" 
                      disabled={isSubmitting || !selectedUser || !password}
                    >
                      {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
