
import React from 'react';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Team } from '@/types/user';
import { motion } from 'framer-motion';
import DirectorView from './DirectorView';
import RegularUserView from './RegularUserView';
import PasswordField from './PasswordField';
import SubmitButton from './SubmitButton';

interface PasswordInputProps {
  selectedUser: User | null;
  password: string;
  onPasswordChange: (password: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  teams: Team[];
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  selectedUser,
  password,
  onPasswordChange,
  isSubmitting,
  onSubmit,
  onBack,
  teams
}) => {
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

      {selectedUser && <DirectorView user={selectedUser} teams={teams} />}
      {selectedUser && <RegularUserView user={selectedUser} />}

      <PasswordField 
        password={password} 
        onPasswordChange={onPasswordChange}
      />

      <SubmitButton 
        isSubmitting={isSubmitting} 
        disabled={!password} 
        onClick={onSubmit}
      />
    </motion.div>
  );
};

export default PasswordInput;
