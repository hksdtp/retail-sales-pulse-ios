import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordFieldProps {
  password: string;
  onPasswordChange: (password: string) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ password, onPasswordChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Không thiết lập mật khẩu mặc định vì lý do bảo mật
  // useEffect đã được xóa để tránh lỗ hổng bảo mật

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
      className="relative mt-4"
    >
      <Input
        id="password"
        type={showPassword ? 'text' : 'password'}
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
  );
};

export default PasswordField;
