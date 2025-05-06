
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PasswordFieldProps {
  password: string;
  onPasswordChange: (password: string) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ password, onPasswordChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Thiết lập mật khẩu mặc định là "password123" khi component được tạo
  useEffect(() => {
    if (!password) {
      onPasswordChange("password123");
    }
  }, []);

  return (
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
  );
};

export default PasswordField;
