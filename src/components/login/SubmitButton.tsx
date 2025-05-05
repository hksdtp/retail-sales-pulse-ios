
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled: boolean;
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting, disabled, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: disabled ? 0.5 : 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <Button 
          type="button" 
          className="w-full h-12 text-lg font-medium bg-ios-blue mt-4"
          disabled={isSubmitting || disabled}
          onClick={onClick}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SubmitButton;
