
import React from 'react';
import { User } from '@/types/user';
import { User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface UserSelectorProps {
  filteredUsers: User[];
  onUserSelect: (user: User) => void;
  onBack: () => void;
}

const positionLabels: Record<string, string> = {
  director: 'Giám đốc Kinh doanh',
  team_leader: 'Trưởng nhóm',
  employee: 'Nhân viên'
};

const UserSelector: React.FC<UserSelectorProps> = ({ 
  filteredUsers, 
  onUserSelect, 
  onBack 
}) => {
  const getAvatarText = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
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
        <label className="text-lg font-medium flex items-center">
          <UserIcon className="h-5 w-5 mr-2 text-ios-blue" />
          Chọn người dùng
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

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
        className="max-h-72 overflow-y-auto space-y-3 pr-1"
      >
        {filteredUsers.map((user, index) => (
          <motion.div 
            key={user.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.03,
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onUserSelect(user)}
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className={`text-white ${user.role === 'team_leader' ? 'bg-ios-blue' : user.role === 'director' ? 'bg-purple-500' : 'bg-gray-500'}`}>
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
          </motion.div>
        ))}
        
        {filteredUsers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-8 text-gray-500"
          >
            Không tìm thấy người dùng nào
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UserSelector;
