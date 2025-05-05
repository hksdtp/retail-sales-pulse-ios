
import React from 'react';
import { User } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { getAvatarText, positionLabels } from './LoginUtils';

interface RegularUserViewProps {
  user: User;
}

const RegularUserView: React.FC<RegularUserViewProps> = ({ user }) => {
  if (!user || user.role === 'director') return null;
  
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-3 p-3 rounded-lg border"
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
            user.role === 'team_leader' ? 'bg-ios-blue' : 'bg-gray-500'
          }`}>
            {positionLabels[user.role]}
          </Badge>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RegularUserView;
