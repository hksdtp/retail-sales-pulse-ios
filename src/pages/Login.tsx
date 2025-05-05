
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType, UserLocation, Team } from '@/types/user';

// Import các component con
import LocationSelector from '@/components/login/LocationSelector';
import TeamSelector from '@/components/login/TeamSelector';
import UserSelector from '@/components/login/UserSelector';
import PasswordInput from '@/components/login/PasswordInput';
import StepIndicator from '@/components/login/StepIndicator';
import { getFilteredTeams, getFilteredUsers } from '@/components/login/LoginUtils';

const Login = () => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const ceo = users.find(user => user.role === 'director');
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
    setFilteredTeams(getFilteredTeams(teams, selectedLocation));
  }, [selectedLocation, teams]);

  // Lọc người dùng theo team hoặc khu vực
  useEffect(() => {
    setFilteredUsers(getFilteredUsers(users, selectedTeam, selectedLocation));
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

            <StepIndicator currentStep={step} />
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
                    <LocationSelector 
                      selectedLocation={selectedLocation}
                      onLocationChange={(location) => {
                        setSelectedLocation(location);
                        setSelectedTeam(null);
                        setSelectedUser(null);
                      }}
                    />
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
                    <TeamSelector 
                      filteredTeams={filteredTeams}
                      users={users}
                      onTeamSelect={(team) => setSelectedTeam(team)}
                      onBack={resetSelections}
                    />
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
                    <UserSelector 
                      filteredUsers={filteredUsers}
                      onUserSelect={(user) => setSelectedUser(user)}
                      onBack={resetSelections}
                    />
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
                    <PasswordInput 
                      selectedUser={selectedUser}
                      password={password}
                      onPasswordChange={setPassword}
                      isSubmitting={isSubmitting}
                      onSubmit={() => handleSubmit(new Event('submit') as any)}
                      onBack={resetSelections}
                      teams={teams}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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
