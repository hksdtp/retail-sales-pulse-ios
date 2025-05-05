
import React, { useState } from 'react';
import { User } from '@/types/user';
import { Eye, EyeOff, MapPin, Briefcase, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Team } from '@/types/user';
import { motion } from 'framer-motion';

interface PasswordInputProps {
  selectedUser: User | null;
  password: string;
  onPasswordChange: (password: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  teams: Team[];
}

const positionLabels: Record<string, string> = {
  director: 'Giám đốc Kinh doanh',
  team_leader: 'Trưởng nhóm',
  employee: 'Nhân viên'
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  selectedUser,
  password,
  onPasswordChange,
  isSubmitting,
  onSubmit,
  onBack,
  teams
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const getAvatarText = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const renderDirectorView = () => {
    if (!selectedUser || selectedUser.role !== 'director') return null;
    
    return (
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center space-y-4 p-6 bg-ios-gray rounded-lg"
      >
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
      </motion.div>
    );
  };

  const renderRegularUserView = () => {
    if (!selectedUser || selectedUser.role === 'director') return null;
    
    return (
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center gap-3 p-3 rounded-lg border"
      >
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
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <label htmlFor="password" className="text-lg font-medium">
          Mật khẩu
        </label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-ios-blue"
        >
          Quay lại
        </Button>
      </div>

      {renderDirectorView()}
      {renderRegularUserView()}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="relative mt-4"
      >
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: password ? 1 : 0.5, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      >
        <Button 
          type="button" 
          className="w-full h-12 text-lg font-medium bg-ios-blue mt-4"
          disabled={isSubmitting || !password}
          onClick={onSubmit}
          whileHover={{ scale: password ? 1.02 : 1 }}
          whileTap={{ scale: password ? 0.98 : 1 }}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default PasswordInput;
