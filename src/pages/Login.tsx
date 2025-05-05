
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType, UserLocation, Team } from '@/types/user';
import LocationSelector from '@/components/login/LocationSelector';
import UserSelector from '@/components/login/UserSelector';
import PasswordInput from '@/components/login/PasswordInput';
import StepIndicator from '@/components/login/StepIndicator';

// Enum để theo dõi các bước đăng nhập
enum LoginStep {
  LOCATION = 'location',
  USER = 'user',
  PASSWORD = 'password'
}

const Login = () => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<LoginStep>(LoginStep.LOCATION);
  const { login, users, teams } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Lọc người dùng dựa trên vị trí đã chọn
  const filteredUsers = users.filter(user => {
    if (selectedLocation === 'all') return true;
    return user.location === selectedLocation;
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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

  const handleLocationSelect = (location: UserLocation | 'all') => {
    setSelectedLocation(location);
    setCurrentStep(LoginStep.USER);
  };

  const handleUserSelect = (user: UserType) => {
    setSelectedUser(user);
    setCurrentStep(LoginStep.PASSWORD);
  };

  const handleBackToLocation = () => {
    setCurrentStep(LoginStep.LOCATION);
    setSelectedUser(null);
  };

  const handleBackToUser = () => {
    setCurrentStep(LoginStep.USER);
    setPassword('');
  };

  // Render bước hiện tại
  const renderCurrentStep = () => {
    switch (currentStep) {
      case LoginStep.LOCATION:
        return (
          <LocationSelector 
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationSelect}
          />
        );
      case LoginStep.USER:
        return (
          <UserSelector 
            filteredUsers={filteredUsers}
            onUserSelect={handleUserSelect}
            onBack={handleBackToLocation}
          />
        );
      case LoginStep.PASSWORD:
        return (
          <PasswordInput
            selectedUser={selectedUser}
            password={password}
            onPasswordChange={setPassword}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onBack={handleBackToUser}
            teams={teams}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }}
        className="w-full max-w-md"
      >
        <Card className="shadow-md border rounded-xl overflow-hidden">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold">Đăng nhập</CardTitle>
              <CardDescription className="text-base pb-4">
                {currentStep === LoginStep.LOCATION && "Chọn khu vực để tiếp tục"}
                {currentStep === LoginStep.USER && "Chọn người dùng để tiếp tục"}
                {currentStep === LoginStep.PASSWORD && "Nhập mật khẩu để đăng nhập"}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <StepIndicator currentStep={
                currentStep === LoginStep.LOCATION ? 1 :
                currentStep === LoginStep.USER ? 2 : 3
              } />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30 
                  }}
                >
                  {renderCurrentStep()}
                </motion.div>
              </AnimatePresence>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <motion.p 
              className="text-center text-blue-500 hover:underline cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Chưa có tài khoản? Đăng ký ngay
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
