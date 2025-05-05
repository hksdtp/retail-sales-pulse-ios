
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ChevronDown, Users, Briefcase, User, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User as UserType, UserLocation, Team, UserRole } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const { login, users, teams } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Cập nhật bước đăng nhập khi chọn các thông tin
  useEffect(() => {
    if (selectedLocation === 'all') {
      // Tìm CEO (Khổng Đức Mạnh)
      const ceo = users.find(user => user.role === 'director' as UserRole);
      if (ceo) {
        setSelectedUser(ceo);
        setStep(4); // Chuyển thẳng đến bước nhập mật khẩu
      }
    } else if (selectedLocation && !selectedTeam) {
      setStep(2); // Chọn team
    } else if (selectedTeam && !selectedUser) {
      setStep(3); // Chọn người dùng
    } else if (selectedUser) {
      setStep(4); // Nhập mật khẩu
    }
  }, [selectedLocation, selectedTeam, selectedUser, users]);

  // Lọc team theo khu vực
  useEffect(() => {
    if (selectedLocation === 'all') {
      setFilteredTeams(teams);
    } else {
      setFilteredTeams(teams.filter(team => team.location === selectedLocation));
    }
  }, [selectedLocation, teams]);

  // Lọc người dùng theo team hoặc khu vực
  useEffect(() => {
    if (selectedTeam) {
      setFilteredUsers(users.filter(user => user.team_id === selectedTeam.id));
    } else if (selectedLocation !== 'all') {
      setFilteredUsers(users.filter(user => user.location === selectedLocation));
    } else {
      setFilteredUsers(users);
    }
  }, [selectedTeam, selectedLocation, users]);

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

  const getTeamMembers = (teamId: string) => {
    return users.filter(user => user.team_id === teamId);
  };

  const resetSelections = () => {
    if (step <= 1) return;
    
    if (step === 2) {
      setSelectedLocation('all');
      setSelectedTeam(null);
    } else if (step === 3) {
      setSelectedTeam(null);
      setSelectedUser(null);
    } else if (step === 4) {
      setSelectedUser(null);
    }
    
    setStep(prevStep => (prevStep > 1 ? prevStep - 1 : prevStep) as 1 | 2 | 3 | 4);
  };

  const getIconForStep = (currentStep: number, stepNumber: number) => {
    if (currentStep >= stepNumber) {
      return <div className="bg-ios-blue text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium">{stepNumber}</div>;
    }
    return <div className="bg-gray-200 text-gray-500 h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium">{stepNumber}</div>;
  };

  const renderDirectorView = () => {
    if (!selectedUser || selectedUser.role !== 'director' as UserRole) return null;
    
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-ios-gray rounded-lg">
        <Avatar className="h-24 w-24 border-4 border-ios-blue">
          <AvatarImage src={selectedUser.avatar} />
          <AvatarFallback className="bg-ios-blue text-white text-2xl">
            {getAvatarText(selectedUser.name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
          <Badge className="mt-2 bg-ios-blue text-white">
            <Briefcase className="h-4 w-4 mr-1" />
            {positionLabels[selectedUser.role]}
          </Badge>
          <p className="mt-2 text-gray-600">{selectedUser.email}</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>Toàn quốc</span>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Quản lý</span>
            <div className="flex items-center justify-center mt-1">
              <Badge variant="outline" className="mr-2">
                <span className="mr-1">{teams.filter(t => t.location === 'hanoi').length}</span>
                <span>Nhóm Hà Nội</span>
              </Badge>
              <Badge variant="outline">
                <span className="mr-1">{teams.filter(t => t.location === 'hcm').length}</span>
                <span>Nhóm Hồ Chí Minh</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ios-gray p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-3xl font-bold">Đăng nhập</CardTitle>
            <CardDescription className="text-base">
              Chọn thông tin và nhập mật khẩu để tiếp tục
            </CardDescription>

            <div className="flex items-center justify-center mt-4 space-x-10">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  {getIconForStep(step, stepNumber)}
                  <span className="text-xs mt-1 text-gray-500">
                    {stepNumber === 1 ? 'Khu vực' : 
                     stepNumber === 2 ? 'Nhóm' : 
                     stepNumber === 3 ? 'Người dùng' : 'Mật khẩu'}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="location-selection"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-lg font-medium flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-ios-blue" />
                        Chọn khu vực
                      </label>
                      <Select 
                        value={selectedLocation} 
                        onValueChange={(value: UserLocation | 'all') => {
                          setSelectedLocation(value);
                          setSelectedTeam(null);
                          setSelectedUser(null);
                        }}
                      >
                        <SelectTrigger className="w-full h-12 text-base">
                          <SelectValue placeholder="Chọn khu vực">
                            {locationNames[selectedLocation]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-base py-3 flex items-center">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-ios-blue flex items-center justify-center mr-2">
                                <Briefcase className="h-3 w-3 text-white" />
                              </div>
                              Toàn quốc
                            </div>
                          </SelectItem>
                          <SelectItem value="hanoi" className="text-base py-3">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                                <MapPin className="h-3 w-3 text-white" />
                              </div>
                              Hà Nội
                            </div>
                          </SelectItem>
                          <SelectItem value="hcm" className="text-base py-3">
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
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="team-selection"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-lg font-medium flex items-center">
                        <Users className="h-5 w-5 mr-2 text-ios-blue" />
                        Chọn nhóm
                      </label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetSelections}
                        className="text-ios-blue"
                      >
                        Quay lại
                      </Button>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                      {filteredTeams.map(team => {
                        const teamMembers = getTeamMembers(team.id);
                        const leader = users.find(user => user.id === team.leader_id);
                        
                        return (
                          <div 
                            key={team.id}
                            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSelectedTeam(team)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-lg">{team.name}</h3>
                                <p className="text-sm text-gray-500">{team.description}</p>
                              </div>
                              <Badge variant="outline" className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {teamMembers.length}
                              </Badge>
                            </div>
                            
                            {leader && (
                              <div className="flex items-center mt-3">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarFallback className="bg-ios-blue text-white">
                                    {getAvatarText(leader.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-sm font-medium">{leader.name}</span>
                                  <div className="flex items-center">
                                    <Badge className="mr-1 h-5 bg-ios-blue text-xs">Trưởng nhóm</Badge>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {filteredTeams.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Không có nhóm nào trong khu vực này
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="user-selection"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-lg font-medium flex items-center">
                        <User className="h-5 w-5 mr-2 text-ios-blue" />
                        Chọn người dùng
                      </label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetSelections}
                        className="text-ios-blue"
                      >
                        Quay lại
                      </Button>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                      {filteredUsers.map(user => (
                        <div 
                          key={user.id}
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={`text-white ${user.role === 'team_leader' ? 'bg-ios-blue' : 'bg-gray-500'}`}>
                              {getAvatarText(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <div className="flex items-center mt-1">
                              <Badge className={`mr-1 h-5 text-xs ${
                                user.role === 'director' ? 'bg-purple-500' : 
                                user.role === 'team_leader' ? 'bg-ios-blue' : 
                                'bg-gray-500'
                              }`}>
                                {positionLabels[user.role]}
                              </Badge>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Không tìm thấy người dùng nào
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    key="password-input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-lg font-medium">
                        Mật khẩu
                      </label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetSelections}
                        className="text-ios-blue"
                      >
                        Quay lại
                      </Button>
                    </div>

                    {renderDirectorView()}

                    {selectedUser && selectedUser.role !== 'director' && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={`text-white ${selectedUser.role === 'team_leader' ? 'bg-ios-blue' : 'bg-gray-500'}`}>
                            {getAvatarText(selectedUser.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{selectedUser.name}</span>
                          <div className="flex items-center mt-1">
                            <Badge className={`mr-1 h-5 text-xs ${
                              selectedUser.role === 'director' ? 'bg-purple-500' : 
                              selectedUser.role === 'team_leader' ? 'bg-ios-blue' : 
                              'bg-gray-500'
                            }`}>
                              {positionLabels[selectedUser.role]}
                            </Badge>
                            <span className="text-xs text-gray-500">{selectedUser.email}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="relative mt-4">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pr-10 h-12 text-base"
                        placeholder="Nhập mật khẩu"
                        autoFocus
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
                  </motion.div>
                )}
              </AnimatePresence>
              
              {step === 4 && (
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium bg-ios-blue mt-4"
                  disabled={isSubmitting || !password}
                >
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              )}
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col justify-center items-center">
            <p className="text-center text-ios-blue hover:underline cursor-pointer">
              Quên mật khẩu?
            </p>
            <div className="text-center text-xs text-muted-foreground mt-4">
              <p>Mật khẩu mặc định: password123</p>
              <p className="mt-1 font-medium">Lần đầu đăng nhập sẽ yêu cầu đổi mật khẩu</p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
