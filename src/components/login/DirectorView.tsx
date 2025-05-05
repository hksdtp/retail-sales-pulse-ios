
import React from 'react';
import { User, Team } from '@/types/user';
import { Briefcase, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { getAvatarText, positionLabels } from './LoginUtils';

interface DirectorViewProps {
  user: User;
  teams: Team[];
}

const DirectorView: React.FC<DirectorViewProps> = ({ user, teams }) => {
  if (user.role !== 'director') return null;
  
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center space-y-4 p-6 bg-ios-gray rounded-lg"
    >
      <Avatar className="h-24 w-24 border-4 border-ios-blue">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="bg-ios-blue text-white text-2xl">
          {getAvatarText(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <Badge className="mt-2 bg-ios-blue text-white">
          <Briefcase className="h-4 w-4 mr-1" />
          {positionLabels[user.role]}
        </Badge>
        <p className="mt-2 text-gray-600">{user.email}</p>
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

export default DirectorView;
